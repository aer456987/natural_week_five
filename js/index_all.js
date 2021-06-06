// import {pagination} from './elements.js';  // 產品畫面可以做元件、購物車也行?

const app = Vue.createApp({
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io',
      pathApi: 'toriha_vuetestapi',
      loginStatus: false,
      loginDatas: {
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
      cart: {
        cartDatas: [],
        totalQty: 0,
        totalPrice: 0,
      }
    }
  },
  // components: {
  //   props: ['page'],
  //   pagination,
  // },
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
      }
      else {
        status.isEmailError = false;
      }
    },
    pwValidateFn(status, datas){      // 驗證 密碼 輸入
      const isText = /^[a-zA-Z0-9]+$/;
      // const include = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/;
      const password = datas.userData.password;
      status.isPwError = true;
      datas.isFill = true;

      if (!isText.test(password)) {
        status.pwErrorMsg = '請勿包含特殊字元';
      } else if (password.length < 6) {
        status.pwErrorMsg = '請勿少於6個字';
      } else if (password.length > 15) {
        status.pwErrorMsg = '請勿超過15個字';
      } 
      // else if (!include.test(password)) {
      //   status.pwErrorMsg = '至少包括一個大小寫字母或數字';
      // } 
      else {
        status.isPwError = false;
      }
    },
    loginFn() {                // 登入事件(希望多個登入提醒)
      const url = `${this.url}/admin/signin`;
      this.loginDatas.error = '資料驗證中，請稍後';

      axios.post(url, this.loginDatas.userData)
      .then(res => {
        if(res.data.success){
          console.log('登入(成功)', res);
          this.loginDatas.error = '登入成功';
        }else{
          console.log('登入(錯誤)', res.data);
          this.loginDatas.error = `${res.data.message}, 請檢察帳號密碼`;
          return;
        }

        const {token, expired} = res.data;
        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
        this.loginStatus = true;
        })
        .catch(err => {
          console.dir('登入(失敗)', err);
        })
    },
    logout() {                 // 登出事件(希望多個登出提醒)
      const url = `${this.url}/logout`

      axios.post(url)
        .then(res => {
          console.log(res);
          if(res.data.success){
            console.log('帳號登出(成功)', res);
            this.loginStatus = false;
          }else{
            console.log('帳號登出(錯誤)', res);
            this.loginStatus = true;
          }
        })
        .catch(err => {
          console.dir('帳號登出(失敗)', err);
        })
    },
    checkLogin() {             // axios check 確認登入狀態
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
    getData(){         // 取得前端資料
      const url = `${this.url}/api/${this.pathApi}/products/all`;

      axios.get(url)
        .then(res => {
          if(res.data.success){
            console.log('取得this資料(成功)', res);
            console.log('前台資料取得(全部資料)', res);
            this.productsList = res.data.products;
          }else{
            console.log('前台資料取得(錯誤)', res.data);
          }
        })
        .catch(err => {
          console.log('前台資料取得(失敗)', err)
        })
    },
    getCatrDatas() {           // 取得購物車資料
      const url = `${this.url}/api/${this.pathApi}/cart`;
      axios.get(url)
        .then(res => {
          if(res.data.success){
            console.log('前台購物車取得(全部資料)', res);
            console.log('前台購物車this資料取得(成功)', this.cart.cartDatas);
            this.cart.cartDatas = res.data.data.carts;
            this.cart.totalPrice = res.data.data.total;
            this.countCartNum();
          }else{
            console.log('前台購物車取得(錯誤)', res.data);
          }
        })
        .catch(err => {
          console.log('前台購物車取得(失敗)', err)
        })
    },
    addCart(id, num = 1) {     // 加入購物車
      const url = `${this.url}/api/${this.pathApi}/cart`;
      let datas = { 
        "product_id": id,
        "qty": num,
      }

      axios.post(url, {"data": datas})
        .then(res => {
          if(res.data.success){
            console.log('加入購物車(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getCatrDatas();
          }else{
            console.log('加入購物車(錯誤)', res.data);
            this.swalFn(res.data.message, 'error');
          }
        })
        .catch(err => {
          console.log('加入購物車(失敗)', err)
        })

    },
    putCart(action, id, num) {     // 加入購物車
      const url = `${this.url}/api/${this.pathApi}/cart/${id}`;
      let newNum = num;

      if (action === 'reduce'){
        if(num === 1){
          this.swalFn('數量不可少於1', 'error');
          return
        }
        newNum -= 1;
      }else if(action === 'add'){
        newNum += 1;
      }

      let datas = { "product_id": id, "qty": newNum }

      axios.put(url, {"data": datas})
        .then(res => {
          if(res.data.success){
            console.log('修改購物車數量(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getCatrDatas();
          }else{
            console.log('修改購物車數量(錯誤)', res.data);
            this.swalFn(res.data.message, 'error');
          }
        })
        .catch(err => {
          console.log('修改購物車數量(失敗)', err)
        })

    },
    delCart(action, id, name){
      let url = ``;
      let productName = '';
      if(action === 'one'){
        url = `${this.url}/api/${this.pathApi}/cart/${id}`;
        productName = name;
        // console.log(id);

      } else if (action === 'all'){
        url = `${this.url}/api/${this.pathApi}/carts`;
        productName = '全部商品';
        // console.log('刪除全部');
      }

      axios.delete(url)
        .then(res => {
          if(res.data.success){
            console.log('刪除購物車(成功)', res);
            this.swalFn(`${productName} ${res.data.message}`, 'success')
            this.getCatrDatas();
          }else{
            console.log('刪除購物車(錯誤)', res.data);
            this.swalFn(res.data.message, 'error');
          }
        })
        .catch(err => {
          console.log('刪除購物車(失敗)', err)
        })
    },
    countCartNum(){            // 計算購物車總數
      this.cart.totalQty = 0;
      this.cart.cartDatas.forEach(item => {
        this.cart.totalQty += item.qty;
      });
    },
    swalFn(title, icon, timer = 2000, text, button = false) {             // 一般提示視窗
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
    this.getData();
    this.getCatrDatas();
  }
});



app.mount('.js_index');