import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import './Product.css';
import axios from 'src/common/myAxios';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page:'product',
      product_data:[]
    };
    this.getUserFeed = this.getUserFeed.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getUserFeed()
  }

  getUserFeed() {
    // PostData('products/get_products',this.state).then((result) => {
    //   if(result){
    //     this.setState({'product_data':result});
    //   }
    //  });
    axios.post('/api/get_products').then((res) => {
            this.setState({
                product_data: res.data,
            });
    });
  }

  onChange(e){
    this.setState({[e.target.name]:e.target.value});
   }

  render() {
    if (this.state.redirectToReferrer) {
      return (<Redirect to={'/login'}/>)
    }
    return (
      <div className="container">
  <h2>Products</h2>
  <table className="table">
    <thead>
      <tr>
        <th>Image</th>
        <th>Qrcode</th>
        <th>Name</th>
        <th>Price</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
    {this.state.product_data.map(function(product, index){
       let image = <img src = {'/files/products/'+product.images[0]} alt="No Product Image" width={50} height={50} />
       let qrcode = <img src = {'/files/qrcodes/'+product.qrcode} alt="No Qrcode" width={50} height={50} />
       return <tr key={ index }><td>{image}</td><td>{qrcode}</td><td>{product.name}</td><td>{product.price}</td><td>{product.description}</td></tr>;
    })}
    </tbody>
  </table>
</div>


    );
  }
}

export default Product;
