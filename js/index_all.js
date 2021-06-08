import { productModal, loadingAnimate } from './elements.js';

const app = Vue.createApp({
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io',
      pathApi: 'toriha_vuetestapi',
      loginStatus: false,     // 登入狀態
      loadingStatus: false,   // loading狀態
      loginDatas: {           // 登入者資料
        userData: {
          username: '',
          password: '',
        },
        isFill: true,         // 判斷登入按鈕是否為禁用
      },
      errorStatus: {          // 錯誤資料整合
        isEmailError: false,  // 判斷欄位是否輸入錯誤
        emailErrorMsg: '',
        isPwError: false,     // 判斷欄位是否輸入錯誤
        pwErrorMsg: '',
        error: '',
      },
      productsList: {},       // 前端商品列表
      product: {              // 單個商品
      },
      cart: {                 // 購物車資訊
        cartDatas: [],
        totalQty: 0,
      },
    }
  },
  components: {
    loadingAnimate,   // loading 動畫
  },
  methods: {
    fromValidateFn(txt){       // 驗證輸入
      const errorStatus = this.errorStatus;
      const loginDatas = this.loginDatas;

      if(txt === 'email'){
        loginDatas.isFill = true;
        this.emailValidateFn(errorStatus, loginDatas);
      }else if(txt === 'password'){
        loginDatas.isFill = true;
        this.pwValidateFn(errorStatus, loginDatas);
      }

      if(loginDatas.userData.username && loginDatas.userData.password){
        loginDatas.isFill = false;
      }
    },
    emailValidateFn(status, datas){   // 驗證 EMAIL 輸入
      const isMail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
      status.isEmailError = true;
      datas.isFill = true;

      if (!isMail.test(datas.userData.username)) {
        status.emailErrorMsg = 'email格式錯誤';
      } else {
        status.isEmailError = false;
      }
    },
    pwValidateFn(status, datas){      // 驗證 密碼 輸入
      const isText = /^[a-zA-Z0-9]+$/;
      const password = datas.userData.password;
      status.isPwError = true;
      datas.isFill = true;

      if (!isText.test(password)) {
        status.pwErrorMsg = '請勿包含特殊字元';
      } else if (password.length < 6) {
        status.pwErrorMsg = '請勿少於6個字';
      } else if (password.length > 15) {
        status.pwErrorMsg = '請勿超過15個字';
      } else {
        status.isPwError = false;
      }
    },
    loginFn() {                // 登入事件(希望多個登入提醒)
      const url = `${this.url}/admin/signin`;
      this.loginDatas.error = '資料驗證中，請稍後';
      this.loadingStatus = true;

      axios.post(url, this.loginDatas.userData)
      .then(res => {
        if(res.data.success){
          console.log('登入(成功)', res);
          this.loginDatas.error = '登入成功';
          this.loadingStatus = false;
        }else{
          console.log('登入(錯誤)', res.data);
          this.loginDatas.error = `${res.data.message}, 請檢察帳號密碼`;
          this.loadingStatus = false;
          return;
        }

        const {token, expired} = res.data;
        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
        this.loginStatus = true;
        })
        .catch(err => {
          console.dir('登入(失敗)', err);
          this.loadingStatus = false;
        })
    },
    logout() {                 // 登出事件(希望多個登出提醒)
      const url = `${this.url}/logout`;
      this.loadingStatus = true;

      axios.post(url)
        .then(res => {
          console.log(res);
          if(res.data.success){
            console.log('帳號登出(成功)', res);
            this.loadingStatus = false;
            this.loginStatus = false;
          }else{
            console.log('帳號登出(錯誤)', res);
            this.loadingStatus = false;
            this.loginStatus = true;
          }
        })
        .catch(err => {
          console.dir('帳號登出(失敗)', err);
          this.loadingStatus = false;
        })
    },
    checkLogin() {             // axios check 確認登入狀態
      const url = `${this.url}/api/user/check`;
      this.loadingStatus = true;

      axios.post(url)
        .then(res => {
          if(res.data.success){
            console.log('前台帳號認證(成功)', res);
            this.loginStatus = true;
            this.loadingStatus = false;
          }else{
            console.log('前台帳號認證(錯誤)', res);
            this.loginStatus = false;
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.dir('前台帳號認證(失敗)', err);
          this.loadingStatus = false;
        })
    },
    getDatas(){                // 取得前端資料
      const url = `${this.url}/api/${this.pathApi}/products/all`;
      this.loadingStatus = true;

      axios.get(url)
        .then(res => {
          if(res.data.success){
            console.log('前台資料取得(全部資料)', res);
            this.productsList = res.data.products;
            this.loadingStatus = false;
          }else{
            console.log('前台資料取得(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('前台資料取得(失敗)', err);
          this.loadingStatus = false;
        })
    },
    openModal(item) {          // 打開單頁商品
      const api = `${this.url}/api/${this.pathApi}/product/${item.id}`;
      this.loadingStatus = true;

      axios.get(api)
        .then(res=> {
          if(res.data.success){
            console.log('取得單頁資料(成功)', res);
            this.product = res.data.product;          // 將取得的單個商品資料存起來
            this.$refs.userProductModal.openModal();  // 使用元件內部的openModal方法 
            this.loadingStatus = false;
          }else{
            console.log('取得單頁資料(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('取得單頁資料(失敗)', err);
          this.loadingStatus = false;
        })
    },
    getCatrDatas() {           // 取得購物車資料
      const url = `${this.url}/api/${this.pathApi}/cart`;
      this.loadingStatus = true;

      axios.get(url)
        .then(res => {
          if(res.data.success){
            console.log('前台購物車取得(全部資料)', res);
            console.log('前台購物車this資料取得(成功)', this.cart.cartDatas);
            this.cart.cartDatas = res.data.data;
            this.loadingStatus = false;
            this.countCartNum();
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
    addCart(id, num = 1) {     // 加入購物車
      const url = `${this.url}/api/${this.pathApi}/cart`;
      let datas = { 
        "product_id": id,
        "qty": num,
      }
      this.loadingStatus = true;

      axios.post(url, {"data": datas})
        .then(res => {
          if(res.data.success){
            console.log('加入購物車(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getCatrDatas();
            this.$refs.userProductModal.hideModal();
            this.loadingStatus = false;
          }else{
            console.log('加入購物車(錯誤)', res.data);
            this.swalFn(res.data.message, 'error');
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('加入購物車(失敗)', err);
          this.loadingStatus = false;
        })

    },
    putCart(action, item) {    // 修改購物車
      const url = `${this.url}/api/${this.pathApi}/cart/${item.id}`;
      let newNum = item.qty;
      this.loadingStatus = true;

      if (action === 'reduce'){
        if(item.qty === 1){
          this.swalFn('數量不可少於1', 'error');
          this.loadingStatus = false;
          return;
        }
        newNum -= 1;
      }else if(action === 'add'){
        newNum += 1;
      }

      let datas = { "product_id": item.id, "qty": newNum }

      axios.put(url, {"data": datas})
        .then(res => {
          if(res.data.success){
            console.log('修改購物車數量(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getCatrDatas();
            this.loadingStatus = false;
          }else{
            console.log('修改購物車數量(錯誤)', res.data);
            this.swalFn(res.data.message, 'error');
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('修改購物車數量(失敗)', err);
          this.loadingStatus = false;
        })

    },
    delCart(action, item){     // 刪除購物車
      let url = ``;
      let productName = '';
      this.loadingStatus = true;

      if(action === 'one'){
        url = `${this.url}/api/${this.pathApi}/cart/${item.id}`;
        productName = item.product.title;

      } else if (action === 'all'){
        url = `${this.url}/api/${this.pathApi}/carts`;
        productName = '全部商品';
      }

      axios.delete(url)
        .then(res => {
          if(res.data.success){
            console.log('刪除購物車(成功)', res);
            this.swalFn(`${productName} ${res.data.message}`, 'success')
            this.getCatrDatas();
            this.loadingStatus = false;
          }else{
            console.log('刪除購物車(錯誤)', res.data);
            this.swalFn(res.data.message, 'error');
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('刪除購物車(失敗)', err);
          this.loadingStatus = false;
        })
    },
    countCartNum(){            // 計算購物車總數
      this.cart.totalQty = 0;
      this.cart.cartDatas.carts.forEach(item => {
        this.cart.totalQty += item.qty;
      });
    },
    swalFn(title, icon, timer = 2000, text, button = false) {    // 一般提示視窗
      const txt = {
        title,
        text,
        icon,
        button,
        timer,
        closeOnClickOutside : false
      };
      swal(txt);
    }
  },
  mounted() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;
    this.checkLogin();
    this.getDatas();
    this.getCatrDatas();
  }
});
app.component('userProductModal', productModal)      // 元件註冊('元件自訂名稱', 載入的元件內容)

app.mount('.js_index');