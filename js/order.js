import { loadingAnimate } from './elements.js';
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidate.defineRule('numeric', VeeValidateRules['numeric']);
VeeValidate.defineRule('min', VeeValidateRules['min']);
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});
const url = 'https://vue3-course-api.hexschool.io';
const pathApi = 'toriha_vuetestapi';


const app = Vue.createApp({
  data() {
    return {
      loadingStatus: false,      // loading狀態
      isData: false,
      loginDatas: {
        isFill: true,           // 判斷登入按鈕是否為禁用
      },
      cart: {                   // 購物車資料
        cartDatas: [],
      },
      userDatas: {              // 訂單人資訊
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      orderStatus: false,       // 訂單填寫完成狀態  可以統一在order物件中(待改
      isPay: false,             // 付款狀態
      orderId: '',
      orderData: {},            // 單一訂單
    }
  },
  components: {
    loadingAnimate,             // loading 動畫
  },
  methods: {
    checkUserDatas() {          // 驗證是否為空訂單
      const user = this.userDatas.user;
      if (user.name === '' || user.email === '' || user.tel === '' || user.address === '') {
        this.isData = false;

      } else {
        this.isData = true;
      }
    },
    getCatrDatas() {               // 取得購物車資料
      const newUrl = `${url}/api/${pathApi}/cart`;
      this.loadingStatus = true;

      axios.get(newUrl)
        .then(res => {
          if (res.data.success) {
            console.log('前台購物車取得(全部資料)', res);
            console.log('前台購物車this資料取得(成功)', this.cart.cartDatas);
            this.cart.cartDatas = res.data.data;
            this.loadingStatus = false;
          } else {
            console.log('前台購物車取得(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('前台購物車取得(失敗)', err);
          this.loadingStatus = false;
        })
    },
    postOrder() {                 // 送出單筆訂單
      const newUrl = `${url}/api/${pathApi}/order`;
      console.log(this.userDatas);
      this.loadingStatus = true;

      axios.post(newUrl, {
          data: this.userDatas
        })
        .then(res => {
          if (res.data.success) {
            console.log('送出訂單(全部資料)', res);
            this.swalFn('訂單已送出', 'success', 2500, `訂單號碼：${res.data.orderId}`);
            this.orderId = res.data.orderId;
            this.getOrder();
            this.loadingStatus = false;
          } else {
            console.log('送出訂單(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('送出訂單(失敗)', err)
          console.dir('送出訂單(失敗)', err)
          this.loadingStatus = false;
        })
    },
    getOrder() {                  // 取得訂單
      const newUrl = `${url}/api/${pathApi}/order/${this.orderId}`;
      this.loadingStatus = true;

      axios.get(newUrl)
        .then(res => {
          if (res.data.success) {
            console.log('取得單筆訂單(成功)', res);
            console.log('取得單筆訂單(成功)', res.data.order);
            this.orderData = JSON.parse(JSON.stringify(res.data.order));
            console.log(this.orderData);
            this.orderStatus = true;
            this.loadingStatus = false;
          } else {
            console.log('取得單筆訂單(錯誤)', res);
            this.orderStatus = false;
            this.loadingStatus = false;

          }
        })
        .catch(err => {
          console.dir('取得單筆訂單(失敗)', err);
          this.orderStatus = false;
          this.loadingStatus = false;
        })
    },
    goPay() {                     // 前往付款
      const newUrl = `${url}/api/${pathApi}/pay/${this.orderId}`;
      this.loadingStatus = true;

      axios.post(newUrl)
        .then(res => {
          if (res.data.success) {
            console.log('訂單付款(全部資料)', res);
            this.swalFn(res.data.message, 'success');
            this.isPay = true;
            this.loadingStatus = false;
          } else {
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
    swalFn(title, icon, timer = 2000, text, button = false) { // 一般提示視窗
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
    this.getCatrDatas();
  }
});
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('.js_index');