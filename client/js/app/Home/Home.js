import React from 'react';
import axios from 'src/common/myAxios';

const getBase64 = (file) => {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          page:'home',
          added:false,
          data:[],
          product_name: '',
          price: '',
          description: '',
          images: '',
          redirectToReferrer: false,
        };
        this.onChange = this.onChange.bind(this);
        this.convertTime = this.convertTime.bind(this);
        this.add_product = this.add_product.bind(this);
        this.logout = this.logout.bind(this);
    }

     add_product() {
    if(this.state.product_name && this.state.price){
      axios.post('/api/add_product',this.state).then((res) => {
            this.setState({
                added: true,
            });
        });
    }
  }

  componentDidMount() {
        // axios.get('/api/counters').then((res) => {
        //     this.setState({
        //         counters: res.data,
        //     });
        // });
  }

  imageUpload = (e) => {
    const file = e.target.files[0];
    getBase64(file).then(base64 => {
      this.setState({images:base64});
    });
  }

  convertTime(created) {
    let date = new Date(created * 1000);
    return date;
  }

  onChange(e){
    this.setState({[e.target.name]:e.target.value});
  }
  logout(){
    sessionStorage.setItem("userData",'');
    sessionStorage.clear();
    this.setState({redirectToReferrer: true});
  }

  render() {
    if (this.state.redirectToReferrer) {
      return (<Redirect to={'/login'}/>)
    }
    return (
      <div className="container">
      <div className="row">
      <div className="col-md-6">
      <h1>Add Product</h1>
      </div>
      </div>
      <div className="row">
      <div className="col-md-6">
      <div className="form-group">
      <label for="productname" className="loginFormElement">Product Name:</label>
      <input className="form-control" id="productname" type="text" name="product_name" onChange={this.onChange} />
      </div>
      <div className="form-group">
      <label for="productprice" className="loginFormElement">Product Price</label>
      <input className="form-control" id="productprice" type="text" name="price" onChange={this.onChange}/>
      </div>
      <div className="form-group">
      <label className="control-label">Product Image</label>
      <input className="filestyle" data-icon="false" type="file" name="image" onChange={this.imageUpload} />
      </div>
      <div className="form-group">
      <label className="loginformelement" for="productdescription">Product Description</label>
      <textarea className="form-control" rows="5" id="comment" name="description" onChange={this.onChange} ></textarea>
      <div className="container">
      </div>
      <button type="button" id="loginSubmit" className="btn btn-success loginFormElement" onClick={() => this.add_product()}>Add Product</button>
      </div>
      </div>
      </div>
      </div>
    );
  }
}

export default Home;
