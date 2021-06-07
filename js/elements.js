// 頁籤
const pagination = {
  props: ['page'],
  // props 命名 page 用來接收外層的 pagination 資料
  template: `
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">
        <li class="page-item" 
          :class="{ disabled : !page.has_pre }">
          <a class="page-link" href="#" aria-label="Previous" 
            @click="$emit('get-product', page.current_page-1 )">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li 
          class="page-item" 
          :class="{ 'active' : item === page.current_page}"
          v-for="item in page.total_pages" 
          :key="item">
          <a class="page-link" href="#"
            @click="$emit('get-product', item)">
            {{ item }}
          </a>
        </li>
        <li class="page-item" :disabled="page.has_next"
          :class="{ disabled : !page.has_next }">
          <a class="page-link" href="#" aria-label="Next"
            @click="$emit('get-product', page.current_page+1 )">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>`,
}


// 商品 model
const productModal = {
  template: `<div class="modal fade" id="productModal" tabindex="-1" role="dialog"
    aria-labelledby="ModalLabel" aria-hidden="true" ref="modal">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content border-0">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title" id="ModalLabel">
            <span>{{ tempProduct.title }}</span>
          </h5>
          <button type="button" class="btn-close"
            data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-12 col-md-6 col-lg-5 pe-3 border-end">
              <img class="img-fluid" :src="tempProduct.imageUrl" alt="商品圖片">
              <div class="row mt-2">
                <div class="col-4 p-1" v-for="img in tempProduct.imagesUrl" :key="img">
                  <img class="img-fluid" :src="img" alt="商品圖片">
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-12 col-md-6 p-3">
              <h5 class="card-title fw-bold mb-2">{{ tempProduct.title }}</h5>
              <span class="badge bg-primary rounded-pill mb-2">{{ tempProduct.category }}</span>

              <p class="card-text m-0 mb-4">
                <span class="fw-bold">有關商品：</span> <br>
                <span class="">
                  {{ tempProduct.description }}
                </span>
              </p>
              <p class="card-text m-0 mb-4">
                <span class="fw-bold">其他說明：</span> <br>
                <span class="">
                  {{ tempProduct.content }}
                </span>
              </p>

              <p class="text-end small m-0 p-0 text-decoration-line-through">
                原價NT $ {{ tempProduct.price }}
              </p>
              <h5 class="text-end fw-bold pb-2">
                快閃特惠價NT $ {{ tempProduct.origin_price }}
              </h5>

              <div class="row flex-row-reverse mt-3">
                <div class="col-6">
                  <div class="input-group">
                    <div class="btn_green_cart border" 
                      @click="changeQty('reduce')">
                      -
                    </div>
                    <input type="number" 
                      class="form-control m-0 p-1 text-center border fw-bold"
                      v-model.number="qty" min="1">
                    <div class="btn_green_cart border" 
                      @click="changeQty('add')">
                      +
                      </div>
                    <i class="fas fa-cart-plus btn_light_green ms-2"
                      @click="$emit('add-cart', tempProduct.id, qty)"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  props: ['product'],       // 接受外部的product
  data() {
    return {
      status: {},
      tempProduct: {},
      modal: '',
      qty: 1,
    };
  },
  watch: {
    product() {
      this.tempProduct = this.product;
    }
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
  methods: {
    openModal() {
      this.qty = 1;
      this.modal.show();
    },
    hideModal() {
      this.modal.hide();
    },
    changeQty(action){
      if(action === 'reduce'){
        if(this.qty > 1){
          this.qty -= 1;
        }else{
          return;
        }
        console.log('reduce:', action);
      }else if(action === 'add'){
        this.qty += 1;
        console.log('add:', action);
      }
    }
  },
}


// loading
const loadingAnimate = {
  props: ['status'],
  template: `
    <div class="loadingImg" v-if="status">
      <img src="./img/loaging.svg" alt="loading">
    </div>`,
}



export { pagination, productModal, loadingAnimate }