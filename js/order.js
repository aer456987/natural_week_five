import { loadingAnimate } from './elements.js';
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidate.defineRule('numeric', VeeValidateRules['numeric']);
VeeValidate.defineRule('min_value', VeeValidateRules['min_value']);
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io',
      pathApi: 'toriha_vuetestapi',
      loginStatus: false,     // 登入狀態
      loadingStatus: false,   // loading狀態
      isData: false,
      loginDatas: {
        isFill: true,         // 判斷登入按鈕是否為禁用
      },
      cart: {                 // 購物車資料
        cartDatas: [],
      },
      userDatas: {            // 訂單人資訊
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      orderStatus: false,     // 訂單填寫完成狀態
      isPay: false,           // 付款狀態
      orderId: '',
      orderData: {},
    }
  },
  components: {
    loadingAnimate,           // loading 動畫
  },
  methods: {
    checkUserDatas(){         // 驗證是否為空訂單
      const user = this.userDatas.user;
      console.log(123);
      if( user.name === '' || user.email === '' || user.tel === '' || user.address === '' ){
        this.isData = false;
      }else{
        this.isData = true;
      }
    },
    logout() {              // 登出事件(希望多個登出提醒)
      const url = `${this.url}/logout`;
      this.loadingStatus = true;

      axios.post(url)
        .then(res => {
          if(res.data.success){
            console.log('帳號登出(成功)', res);
            this.loginStatus = false;
            this.loadingStatus = false;
          }else{
            console.log('帳號登出(錯誤)', res);
            this.loginStatus = true;
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.dir('帳號登出(失敗)', err);
          this.loadingStatus = false;
        })
    },
    checkLogin() {          // axios check 確認登入狀態
      const url = `${this.url}/api/user/check`;

      axios.post(url)
        .then(res => {
          if(res.data.success){
            console.log('前台帳號認證(成功)', res);
            this.loginStatus = true;
          }else{
            console.log('前台帳號認證(錯誤)', res);
            this.loginStatus = false;
          }
        })
        .catch(err => {
          console.dir('前台帳號認證(失敗)', err);
        })
    },
    getCatrDatas() {        // 取得購物車資料
      const url = `${this.url}/api/${this.pathApi}/cart`;
      this.loadingStatus = true;

      axios.get(url)
        .then(res => {
          if(res.data.success){
            console.log('前台購物車取得(全部資料)', res);
            console.log('前台購物車this資料取得(成功)', this.cart.cartDatas);
            this.cart.cartDatas = res.data.data.carts;
            this.cart.totalPrice = res.data.data.total;
            this.loadingStatus = false;
          }else{
            console.log('前台購物車取得(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('前台購物車取得(失敗)', err);
          this.loadingStatus = false;
        })
    },
    postOrder() {           // 送出訂單
      const url = `${this.url}/api/${this.pathApi}/order`;
      console.log(this.userDatas);
      this.loadingStatus = true;

      axios.post(url, { data : this.userDatas})
        .then(res => {
          if(res.data.success){
            console.log('送出訂單(全部資料)', res);
            this.swalFn('訂單已送出', 'success', 3500, `訂單號碼：${res.data.orderId}`);
            this.orderId = res.data.orderId;
            this.orderStatus = true;
            this.getOrder();
            this.loadingStatus = false;
          }else{
            console.log('送出訂單(錯誤)', res.data);
            this.orderStatus = false;
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('送出訂單(失敗)', err)
          console.dir('送出訂單(失敗)', err)
          this.orderStatus = false;
          this.loadingStatus = false;
        })
    },
    getOrder(){
      const url = `${this.url}/api/${this.pathApi}/order/${this.orderId}`;
      this.loadingStatus = true;

      axios.get(url)
        .then(res => {
          if(res.data.success){
            console.log('取得單筆訂單(成功)', res);
            console.log('取得單筆訂單(成功)', res.data.order);
            this.orderData = JSON.parse(JSON.stringify(res.data.order));
            console.log(this.orderData);
            this.loadingStatus = false;
          }else{
            console.log('取得單筆訂單(錯誤)', res);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.dir('取得單筆訂單(失敗)', err);
          this.loadingStatus = false;
        })
    },
    goPay() {
      const url = `${this.url}/api/${this.pathApi}/pay/${this.orderId}`;
      this.loadingStatus = true;

      axios.post(url)
        .then(res => {
          if(res.data.success){
            console.log('訂單付款(全部資料)', res);
            this.swalFn(res.data.message, 'success');
            this.isPay = true;
            this.loadingStatus = false;
          }else{
            console.log('訂單付款(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('訂單付款(失敗)', err);
          console.dir('訂單付款(失敗)', err);
          this.loadingStatus = false;
        })
    },
    swalFn(title, icon, timer = 2000, text, button = false) {    // 一般提示視窗
      // success (成功) ； error (叉叉) ； warning(警告) ； info (說明)
      const txt = {
        title,
        text,
        icon,
        button,
        timer,
      };
      swal(txt);
    }
  },
  mounted() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;

    this.checkLogin();
    this.getCatrDatas();
  }
});
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('.js_index');