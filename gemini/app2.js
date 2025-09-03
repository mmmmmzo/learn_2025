// geminiの出力
// test
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
                this.renderInitialContent();

            })
            .catch(error => {
                console.error('APIの取得に失敗しました:', error);
            });

    };

    bindEvent() {
        this.textBox.addEventListener('keyup', () => this.countTxtLength());
        this.typeSelect.addEventListener('change', this.handleTypeSelect.bind(this));
        this.registBtn.addEventListener('click', this.handleRegistration.bind(this));
        this.cancelBtn.addEventListener('click', this.closeModal.bind(this));
    };

    // 初期表示とタイプ選択時の表示を統一
    renderInitialContent() {
        const list = Object.keys(this.jsonList).slice(0, 3).map(key => ({
            title: key,
            text: this.jsonList[key].description
        }))

        this.renderWazaList(list);
        this.renderTypeOptions();
        this.bindEvent();
        this.textBox.disabled = false;
    };

    // タイプの選択肢を生成
    renderTypeOptions() {
        const allTypes = Object.values(this.jsonList).map(list => list.type);
        const uniqueTypes = [...new Set(allTypes)];
        const optionsHtml = uniqueTypes.map(type => `<option value="${type}">${type}</option>`).join('');
        this.typeSelect.insertAdjacentHTML('beforeend', optionsHtml);
    };

    // 技のリストをDOMに描画する関数
    renderWazaList(list) {
        console.log(1, list, this.overWriteTxtList)
        this.overWriteTxtList.innerHTML = '';
        const html = list.map(item => `
      <div class="${CLASS_BLOCK_OVER_WRITE}">
        <dt class="${CLASS_OVER_WRITE}">【${item.title}】${item.text}</dt>
        <dd>
          <button type="button" class="${BUTTON_OVER_WRITE}">上書き</button>
        </dd>
        <dd class="rateBtnArea">
          <button type="button" class="rateBtn" data-rate="${BUTTON_RATE_GOOD}">GOOD</button>
          <button type="button" class="rateBtn" data-rate="${BUTTON_RATE_BAD}">BAD</button>
        </dd>
      </div>
    `).join('');
        this.overWriteTxtList.insertAdjacentHTML('beforeend', html);
        this.bindOverWriteButtons();
    };

    // 上書きボタンと評価ボタンにイベントリスナーを再設定
    bindOverWriteButtons() {
        const overWriteBtns = Array.from(document.getElementsByClassName(BUTTON_OVER_WRITE));
        const rateBtns = Array.from(document.getElementsByClassName('rateBtn'));

        overWriteBtns.forEach((item, i) => item.addEventListener('click', () => this.confirmOverWrite(item, i)));
        rateBtns.forEach(item => item.addEventListener('click', () => this.checkRateBtn(item)));
    };

    handleTypeSelect(event) {
        const selectedType = event.currentTarget.value;
        const filteredList = Object.keys(this.jsonList)
            .filter(key => this.jsonList[key].type === selectedType)
            .map(key => ({
                title: key,
                text: this.jsonList[key].description
            }));
        this.renderWazaList(filteredList.slice(0, 3));
    };

    handleRegistration() {
        // 登録処理
        this.closeModal();
    };

    confirmOverWrite(item, i) {
        this.openModal();
        this.confirmMsg.classList.remove(CLASS_HIDDEN);
    };

    closeModal() {
        this.modalArea.classList.add(CLASS_HIDDEN);
    };

    openModal() {
        this.modalArea.classList.remove(CLASS_HIDDEN);
    };

    //... (他の既存メソッド)
};

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
})