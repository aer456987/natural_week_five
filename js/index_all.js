import { productModal, loadingAnimate } from './elements.js';
const url = 'https://vue3-course-api.hexschool.io';
const pathApi = 'toriha_vuetestapi';

const app = Vue.createApp({
  data() {
    return {
      loadingStatus: false,      // loading狀態
      errorStatus: {             // 錯誤資料整合
        isEmailError: false,     // 判斷欄位是否輸入錯誤
        emailErrorMsg: '',
        isPwError: false,        // 判斷欄位是否輸入錯誤
        pwErrorMsg: '',
        error: '',
      },
      renderDatas: [],
      products: {                // 篩選商品列表
        all: [],                 // 前端商品列表
        projects: [],            // 專案
        feeds: [],               // 飼料
        cages: [],               // 籠具
        toys: [],                // 玩具
        other: [],               // 其餘用品
      },
      product: {                 // 單個商品
      },
      cart: {                    // 購物車資訊
        cartDatas: [],
        totalQty: 0,
      },
    }
  },
  components: {
    loadingAnimate,              // loading 動畫
  },
  methods: {
    getDatas() {                // 取得前端資料
      const newUrl = `${url}/api/${pathApi}/products/all`;
      this.loadingStatus = true;

      axios.get(newUrl)
        .then(res => {
          if (res.data.success) {
            console.log('前台資料取得(全部資料)', res);
            this.products.all = res.data.products;
            this.renderDatas = this.products.all;
            this.loadingStatus = false;
            this.filterDates(res.data.products);
          } else {
            console.log('前台資料取得(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('前台資料取得(失敗)', err);
          this.loadingStatus = false;
        })
    },
    filterDates(allData) {      // 產品分類
      allData.forEach(item => {
    
        if(item.category === '募款專案'){
          this.products.projects.push(item);
    
        }else if(item.category === '飼料') {
          this.products.feeds.push(item);
    
        }else if(item.category === '籠具') {
          this.products.cages.push(item);
    
        }else if(item.category === '玩具') {
          this.products.toys.push(item);
    
        }else if(item.category === '其餘用品') {
          this.products.other.push(item);
    
        }
      });
    },
    changeProduct(e) {          // 篩選表單功能

      if(e.target.innerText === '全部商品'){
        this.renderDatas = this.products.all;

      }else if(e.target.innerText === '募款專案'){
        this.renderDatas = this.products.projects;

      }else if(e.target.innerText === '飼料') {
        this.renderDatas = this.products.feeds;

      }else if(e.target.innerText === '籠具') {
        this.renderDatas = this.products.cages;

      }else if(e.target.innerText === '玩具') {
        this.renderDatas = this.products.toys;

      }else if(e.target.innerText === '其餘用品') {
        this.renderDatas = this.products.other;
      }
    },
    openModal(item) {           // 打開單頁商品
      const api = `${url}/api/${pathApi}/product/${item.id}`;
      this.loadingStatus = true;

      axios.get(api)
        .then(res => {
          if (res.data.success) {
            console.log('取得單頁資料(成功)', res);
            this.product = res.data.product;         // 將取得的單個商品資料存起來
            this.$refs.userProductModal.openModal(); // 使用元件內部的openModal方法 
            this.loadingStatus = false;
          } else {
            console.log('取得單頁資料(錯誤)', res.data);
            this.loadingStatus = false;
          }
        })
        .catch(err => {
          console.log('取得單頁資料(失敗)', err);
          this.loadingStatus = false;
        })
    },
    getCatrDatas() {            // 取得購物車資料
      const newUrl = `${url}/api/${pathApi}/cart`;
      this.loadingStatus = true;

      axios.get(newUrl)
        .then(res => {
          if (res.data.success) {
            console.log('前台購物車取得(全部資料)', res);
            console.log('前台購物車this資料取得(成功)', this.cart.cartDatas);
            this.cart.cartDatas = res.data.data;
            this.loadingStatus = false;
            this.countCartNum();
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
    addCart(id, num = 1) {      // 加入購物車
      const newUrl = `${url}/api/${pathApi}/cart`;
      let datas = {
        "product_id": id,
        "qty": num,
      }
      this.loadingStatus = true;

      axios.post(newUrl, {
          "data": datas
        })
        .then(res => {
          if (res.data.success) {
            console.log('加入購物車(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getCatrDatas();
            this.$refs.userProductModal.hideModal();
            this.loadingStatus = false;
          } else {
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
    putCart(action, item) {     // 修改購物車
      const newUrl = `${url}/api/${pathApi}/cart/${item.id}`;
      let newNum = item.qty;
      this.loadingStatus = true;

      if (action === 'reduce') {
        if (item.qty === 1) {
          this.swalFn('數量不可少於1', 'error');
          this.loadingStatus = false;
          return;
        }
        newNum -= 1;
      } else if (action === 'add') {
        newNum += 1;
      }

      let datas = {
        "product_id": item.id,
        "qty": newNum
      }

      axios.put(newUrl, {
          "data": datas
        })
        .then(res => {
          if (res.data.success) {
            console.log('修改購物車數量(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getCatrDatas();
            this.loadingStatus = false;
          } else {
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
    delCart(action, item) {  // 刪除購物車
      let newUrl = ``;
      let productName = '';
      this.loadingStatus = true;

      if (action === 'one') {
        newUrl = `${url}/api/${pathApi}/cart/${item.id}`;
        productName = item.product.title;

      } else if (action === 'all') {
        newUrl = `${url}/api/${pathApi}/carts`;
        productName = '全部商品';
      }

      axios.delete(newUrl)
        .then(res => {
          if (res.data.success) {
            console.log('刪除購物車(成功)', res);
            this.swalFn(`${productName} ${res.data.message}`, 'success')
            this.getCatrDatas();
            this.loadingStatus = false;
          } else {
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
    countCartNum() {         // 計算購物車總數
      this.cart.totalQty = 0;
      this.cart.cartDatas.carts.forEach(item => {
        this.cart.totalQty += item.qty;
      });
    },
    swalFn(title, icon, timer = 2000, text, button = false) {    // 一般提示視窗
      // success (成功) ； error (叉叉) ； warning(警告) ； info (說明)
      const txt = {
        title,
        text,
        icon,
        button,
        timer,
        closeOnClickOutside: false
      };
      swal(txt);
    }
  },
  mounted() {
    this.getDatas();
    this.getCatrDatas();
  }
});
app.component('userProductModal', productModal) // 元件註冊('元件自訂名稱', 載入的元件內容)

app.mount('.js_index');