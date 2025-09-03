const CLASS_SELECT = 'isSelect',
  CLASS_HIDDEN = 'hidden',
  CLASS_OVER_WRITE = 'overWriteTxt',
  CLASS_BLOCK_OVER_WRITE = 'overWriteTxtBlock',
  BUTTON_RATE_GOOD = 'good',
  BUTTON_RATE_BAD = 'bad',
  BUTTON_OVER_WRITE = 'overWriteBtn';

class App {
  constructor() {
    this.setParameters();
    this.fetchAPI();
  };
  setParameters() {
    this.jsonList = [];
    this.textList = [];
    this.typeList = [];
    this.buttons = [];
    this.textBoxArea = document.querySelector('.textBoxArea');
    this.textBox = document.querySelector('#textBox');
    this.textLength = document.querySelector('.textLength');
    this.typeSelect = document.querySelector('#typeSelect');
    this.cancelBtn = document.querySelector('.cancelBtn');
    this.registBtn = document.querySelector('.registBtn');
    this.modalArea = document.querySelector('.modalArea');
    this.confirmMsg = document.querySelector('.confirmMsg');
    this.overWriteTxtList = document.querySelector('.overWriteTxtList');
  };
  fetchAPI() {
    fetch('./waza_list.json')
      .then(response => response.json())
      .then(json => {
        this.jsonList = json.waza_list.LegendsArceus;

        // タイプの種類を抽出
        const allTypes = Object.values(this.jsonList).map(list => list.type);
        const typeList = new Set(allTypes); // 重複はカウントせず
        this.typeList = [...typeList];

        this.createTypeSelectOption();
        this.createOverWriteTxtArea(this.jsonList);
        this.bindEvent();
      })
      .catch(error => console.error('Error:', error));
  };
  bindEvent() {
    this.textBox.addEventListener('keyup', () => this.countTxtLength());
    this.overWriteBtns.forEach((item, i) => item.addEventListener('click', () => this.confirmOverWrite(item, i)));
    this.rateBtns.forEach(item => item.addEventListener('click', () => this.checkRateBtn(item)));

    // this.typeSelect.addEventListener('change', this.changeTypeSelect.bind(this)); // メモ：bindの書き方例
    this.typeSelect.addEventListener('change', (event) => this.changeTypeSelect(event));

  };
  createOverWriteTxtArea(list) {
    // ここでリストをクリアする
    this.overWriteTxtList.innerHTML = '';

    // 上から3件抽出を抽出
    this.textList = Object.keys(list).slice(0, 3).map(key => ({
      title: key,
      text: list[key].description
    }));

    // テキストボックスと評価ボタン
    if (this.textList.length) {
      this.textList.forEach(item => {
        const html = `<div class="${CLASS_BLOCK_OVER_WRITE}">
        <dt class="${CLASS_OVER_WRITE}">【${item.title}】${item.text}</dt>
        <dd>
        <button type="button" class="${BUTTON_OVER_WRITE}">上書き</button>
        </dd>
        <dd class="rateBtnArea">
        <button type="button" class="rateBtn" data-rate="${BUTTON_RATE_GOOD}">GOOD</button>
        <button type="button" class="rateBtn" data-rate="${BUTTON_RATE_BAD}">BAD</button>
        </dd>
        </div>`;
        document.querySelector('.overWriteTxtList').insertAdjacentHTML('beforeend', html)
      });
      this.overWriteBtns = Array.from(document.getElementsByClassName(BUTTON_OVER_WRITE));
      this.rateBtns = Array.from(document.getElementsByClassName('rateBtn'));
    }
    this.countTxtLength();

    // ローディングの解除
    setTimeout(() => {
      this.textBox.disabled = false;
      this.closeModal();
      document.querySelector('.loadingMsg').classList.add(CLASS_HIDDEN);
    }, 500);
  };
  createTypeSelectOption() {
    // タイプ_セレクトボックス
    if (this.typeList.length) {
      this.typeList.forEach(item => {
        const html = `<option value="${item}">${item}</option>`;
        document.querySelector('#typeSelect').insertAdjacentHTML('beforeend', html);
      })
    }
  };

  changeTypeSelect(event) {
    // タイプの変更
    const type = event.currentTarget.value;

    // Object.entriesを使ってキーと値のペアの配列を取得
    const filteredEntries = Object.entries(this.jsonList).filter(([key, value]) => value.type === type);

    // Object.fromEntriesを使ってキーと値のペアから新しいオブジェクトを生成
    const filterList = Object.fromEntries(filteredEntries);

    this.createOverWriteTxtArea(filterList);
  };
  countTxtLength() {
    let len = 0;
    Array.from(this.textBox.value).forEach(item => {
      (item.match(/[ -~]/)) ? len += 0.5 : len += 1;
    })
    this.textLength.textContent = len;
    this.textBoxArea.classList.remove('err');
    // 文字数オーバーの処理
    if (this.textLength.textContent > 52) this.textBoxArea.classList.add('err');
  };
  confirmOverWrite(item, i) {
    //モーダルを表示させる
    this.openModal();
    this.confirmMsg.classList.remove(CLASS_HIDDEN);

    this.registBtn.addEventListener('click', () => {
      // textboxに上書きする
      const overWriteTxt = document.getElementsByClassName(CLASS_OVER_WRITE)[i].textContent;
      this.textBox.value = overWriteTxt;
      this.countTxtLength();

      // 着色する
      const hasClass = document.querySelector(`.${CLASS_BLOCK_OVER_WRITE}.${CLASS_SELECT}`);
      if (hasClass) hasClass.classList.remove(CLASS_SELECT);
      item.closest('div').classList.add(CLASS_SELECT);
      this.closeModal();
    })

    this.cancelBtn.addEventListener('click', () => {
      this.closeModal();
    })
  };
  closeModal() {
    this.modalArea.classList.add(CLASS_HIDDEN);
  };
  openModal() {
    this.modalArea.classList.remove(CLASS_HIDDEN);
  }
  checkRateBtn(item) {
    // goodかbadボタン選択
    const clickRate = item.dataset.rate;
    if (clickRate === BUTTON_RATE_GOOD) {
      item.classList.toggle(CLASS_SELECT);
      item.nextElementSibling.classList.remove(CLASS_SELECT); // bad
    }
    if (clickRate === BUTTON_RATE_BAD) {
      item.classList.toggle(CLASS_SELECT);
      item.previousElementSibling.classList.remove(CLASS_SELECT); // good
    }
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new App();
})

