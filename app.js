const CLASS_SELECT = 'isSelect',
  CLASS_HIDDEN = 'hidden',
  CLASS_ERR = 'err',
  CLASS_OVER_WRITE = 'overWriteTxt',
  CLASS_BLOCK_OVER_WRITE = 'overWriteTxtBlock',
  BUTTON_OVER_WRITE = 'overWriteBtn',
  BUTTON_RATE = 'rate',
  BUTTON_RATE_GOOD = 'good',
  BUTTON_RATE_BAD = 'bad',
  MAX_LENGTH = 52;

class App {
  constructor() {
    this.setParameters();
    this.fetchAPI();
  };
  setParameters() {
    this.jsonList = [];
    this.selectIndex = 0;
    this.textBoxArea = document.querySelector('.textBoxArea');
    this.textBox = document.querySelector('#textBox');
    this.textLength = document.querySelector('.textLength');
    this.typeSelect = document.querySelector('#typeSelect');
    this.cancelBtn = document.querySelector('.cancelBtn');
    this.registBtn = document.querySelector('.registBtn');
    this.modalArea = document.querySelector('.modalArea');
    this.confirmMsg = document.querySelector('.confirmMsg');
    this.overWriteTxtList = document.querySelector('.overWriteTxtList');
    this.overWriteTxtBlocks = [];
    this.overWriteBtns = [];
    this.rateBtns = [];
  };
  fetchAPI() {
    fetch('./waza_list.json')
      .then(response => response.json())
      .then(json => {
        this.jsonList = json.waza_list.LegendsArceus;

        this.renderInitialContent(this.jsonList);
        this.createTypeSelectOption();
        this.bindEvent();
      })
      .catch(error => console.error('Error:', error));
  };
  renderInitialContent(list) {
    // 上から3件抽出を抽出
    const txtList = Object.keys(list).slice(0, 3).map(key => ({
      title: key,
      type: list[key].type,
      text: list[key].description
    }));
    this.createOverWriteTxtArea(txtList);
  };
  createOverWriteTxtArea(list) {
    this.overWriteTxtList.innerHTML = '';

    console.log('list：', list)
    // テキストボックスと評価ボタン
    const html = list.map(item =>
      `<div class="${CLASS_BLOCK_OVER_WRITE}">
        <dt class="${CLASS_OVER_WRITE}">[${item.type}]${item.title}：${item.text}</dt>
        <dd>
        <button type="button" class="${BUTTON_OVER_WRITE}">上書き</button>
        </dd>
        <dd class="rateBtnArea">
        <button type="button" class="${BUTTON_RATE}" data-rate="${BUTTON_RATE_GOOD}">GOOD</button>
        <button type="button" class="${BUTTON_RATE}" data-rate="${BUTTON_RATE_BAD}">BAD</button>
        </dd>
        </div>`
    ).join('');
    this.overWriteTxtList.insertAdjacentHTML('beforeend', html);
    // ここで作った作られた情報取得
    this.overWriteTxtBlocks = Array.from(document.getElementsByClassName(CLASS_BLOCK_OVER_WRITE));
    this.overWriteBtns = Array.from(document.getElementsByClassName(BUTTON_OVER_WRITE));
    this.rateBtns = Array.from(document.getElementsByClassName(BUTTON_RATE));
    this.bindOverWriteButtons();
    this.countTxtLength();
    this.loadingCompleted();
  };
  createTypeSelectOption() {
    // タイプの種類を抽出
    const allTypes = Object.values(this.jsonList).map(list => list.type);
    const typeList = [...new Set(allTypes)]; // 重複はカウントせず

    const options = typeList.map(item => `<option value="${item}">${item}</option>`).join('');
    this.typeSelect.insertAdjacentHTML('beforeend', options);
  };
  bindEvent() {
    this.textBox.addEventListener('keyup', () => this.countTxtLength());
    this.typeSelect.addEventListener('change', this.changeTypeSelect.bind(this)); // メモ：bindの書き方例
    // this.typeSelect.addEventListener('change', (event) => this.changeTypeSelect(event)); // アロー関数ならこっち

    this.registBtn.addEventListener('click', this.outputTxt.bind(this));
    // this.registBtn.addEventListener('click', () => this.outputTxt()); // アロー関数ならこっち

    this.cancelBtn.addEventListener('click', this.closeModal.bind(this));
  };
  bindOverWriteButtons() {
    // 上書きボタン押下処理
    this.overWriteBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        // クリックされたボタンのインデックスを保存し、モーダルを開く
        this.selectIndex = i;
        this.openModal();
      });
    });
    this.rateBtns.forEach(btn => btn.addEventListener('click', () => this.checkRateBtn(btn)));
  };
  changeTypeSelect(event) {
    // ★Geminiに教えてもらう…。
    // タイプの変更
    const type = event.currentTarget.value;
    let filterList = {};

    if (type === 'ALL') {
      filterList = this.jsonList;
    } else {
      // Object.entriesを使ってキーと値のペアの配列を取得
      const filteredEntries = Object.entries(this.jsonList).filter(([key, value]) => value.type === type);

      // Object.fromEntriesを使ってキーと値のペアから新しいオブジェクトを生成
      filterList = Object.fromEntries(filteredEntries);
    }
    this.renderInitialContent(filterList);
  };
  outputTxt() {
    // テキストをboxに上書きする
    const targetBlock = this.overWriteTxtBlocks[this.selectIndex];
    if (targetBlock) {
      // .overWriteTxtというクラスを持つdt要素を直接探す
      const overWriteTxt = targetBlock.querySelector(`.${CLASS_OVER_WRITE}`).textContent;
      this.textBox.value = overWriteTxt;
      this.countTxtLength();
      this.colorSelectedBlock(targetBlock);
    }

    this.closeModal();
  };
  colorSelectedBlock(target) {
    // 選択元に色を付ける
    this.overWriteTxtBlocks.forEach(item => {
      item.querySelector(`.${CLASS_BLOCK_OVER_WRITE}.${CLASS_SELECT}`);
      if (item) item.classList.remove(CLASS_SELECT);
    })

    target.classList.add(CLASS_SELECT);
  };
  countTxtLength() {
    let len = 0;
    Array.from(this.textBox.value).forEach(text => {
      (text.match(/[ -~]/)) ? len += 0.5 : len += 1;
    })
    this.textLength.textContent = len;
    this.textBoxArea.classList.remove(CLASS_ERR);
    // 文字数オーバーの処理
    if (this.textLength.textContent > MAX_LENGTH) this.textBoxArea.classList.add(CLASS_ERR);
  };
  checkRateBtn(btn) {
    // goodかbadボタン選択
    const clickRate = btn.dataset.rate;
    if (clickRate === BUTTON_RATE_GOOD) {
      btn.classList.toggle(CLASS_SELECT);
      btn.nextElementSibling.classList.remove(CLASS_SELECT); // bad
    }
    if (clickRate === BUTTON_RATE_BAD) {
      btn.classList.toggle(CLASS_SELECT);
      btn.previousElementSibling.classList.remove(CLASS_SELECT); // good
    }
  };
  closeModal() {
    this.modalArea.classList.add(CLASS_HIDDEN);
  };
  openModal() {
    this.confirmMsg.classList.remove(CLASS_HIDDEN);
    this.modalArea.classList.remove(CLASS_HIDDEN);
  };
  loadingCompleted() {
    // 形だけ作ったものなので数秒で消える
    // ローディングの解除
    setTimeout(() => {
      this.textBox.disabled = false;
      this.closeModal();
      document.querySelector('.loadingMsg').classList.add(CLASS_HIDDEN);
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => new App());

