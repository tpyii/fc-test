import React from 'react';
export const OrdersContext = React.createContext();

class Orders extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      orders: [],
      orderId: '',
      orderTitle: '',
      orderEditing: false,

      handleInputChange: this.handleInputChange,
      addOrder: this.addOrder,
      updateOrder: this.updateOrder,
      handleDeleteOrder: this.handleDeleteOrder,
      handleCancelEditOrder: this.handleCancelEditOrder,
      editOrder: this.editOrder,
    }
  }

  componentWillMount = () => {
    this.fetchOrders();
  }

  handleInputChange = event => {
    const target = event.target;
    const name = target.name;
    let value = '';

    if(target.type === 'checkbox')
      value = target.checked;
    else if(target.type === 'select-multiple') {
      const options = target.options;
      value = [];
      for(let i = 0; i < options.length; i++) {
        if(options[i].selected) 
          value.push(options[i].value);
      }
    }
    else
      value = target.value;

    this.setState({[name]: value});
  }

  addOrder = event => {
    event.preventDefault();

    if(!this.state.orderTitle.trim().length)
      return false;

    const order = {
      title: this.state.orderTitle
    }

    fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
      headers: {'content-type': 'application/json'}
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        console.log(result.error)
        return;
      }

      if(result) {
        this.setState(state => {
          return {
            orderTitle: '',
            orders: [...state.orders, result]
          }
        })
      }
    })
    .catch(e => console.log(e));
  }

  updateOrder = e => {
    e.preventDefault();

    if(!this.state.orderTitle.trim().length ||
       !this.state.orderId.length)
      return;

    const order = {
      title: this.state.orderTitle,
    }

    fetch(`/api/orders/${this.state.orderId}`, {
      method: 'PUT',
      body: JSON.stringify(order),
      headers: {'content-type': 'application/json'}
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        return;
      }

      if(result) {
        const orders = this.state.orders.map(order => {
          if(order.id == this.state.orderId)
            return {...order, ...result}

          return order;
        });

        this.setState({
          orderId: '',
          orderTitle: '',
          orderEditing: false,
          orders
        })
      }
    })
    .catch(e => console.log(e));
  }

  handleDeleteOrder = e => {
    e.preventDefault();

    if(!this.state.orderId)
      return;

    fetch(`/api/orders/${this.state.orderId}`, {
      method: 'DELETE'
    })
    .then(responce => responce.json())
    .then(result => {
      if(result.error) {
        console.log(result.error);
        return;
      }

      if(result) {
        const orders = this.state.orders.filter(order => order.id != result)
      
        this.setState({
          orderId: '',
          orderTitle: '',
          orderEditing: false,
          orders
        });
      }
    })
    .catch(e => console.log(e));
  }

  handleCancelEditOrder = e => {
    e.preventDefault();
    this.setState({
      orderId: '',
      orderTitle: '',
      orderEditing: false
    })
  }

  editOrder = order => {
    this.setState({
      orderTitle: order.title,
      orderId: order.id,
      orderEditing: true
    })
  }

  fetchOrders = () => {    
    fetch('/api/orders')
      .then(responce => responce.json())
      .then(result => {
        if(result.error) {
          console.log(result.error);
          return;
        }

        if(result)
          this.setState({orders: result})
      })
      .catch(e => console.log(e));
  }

  render() {
    return (
      <OrdersContext.Provider value={this.state}>
        <Layout />
      </OrdersContext.Provider>
    )
  }
}

Orders.contextType = OrdersContext;

function Layout() {
  return (
    <div className="wrapper">
      <div className="section section__left">
        <OrdersForm />
      </div>
      <div className="section section__right">
        <OrdersTable />
      </div>
    </div>
  )
}

function OrdersForm() {
  return (
    <OrdersContext.Consumer>
      {context => (
        <form className="card" onSubmit={context.orderEditing ? context.updateOrder : context.addOrder}>
          <h5 className="card-header bg-white">{context.orderEditing ? 'Edit' : 'Add'} Order</h5>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="orderTitle">Title</label>
              <input 
                type="text" 
                className="form-control" 
                id="orderTitle" 
                name="orderTitle" 
                value={context.orderTitle} 
                onChange={context.handleInputChange} 
              />
            </div>
            <input type="hidden" value={context.orderId} />
          </div>
          <div className="card-footer bg-white">
            <div className="btn-group">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!context.orderTitle.trim().length}
              >
                {context.orderEditing ? 'Update' : 'Add'}
              </button>
              {context.orderEditing && <button type="button" className="btn btn-primary" onClick={context.handleDeleteOrder}>Delete</button>}
              {
                context.orderTitle.trim().length
                  ? <button type="button" className="btn btn-primary" onClick={context.handleCancelEditOrder}>Cancel</button>
                  : false
              }
            </div>
          </div>
        </form>
      )}
    </OrdersContext.Consumer>
  )
}

function OrdersTable() {
  return (
    <OrdersContext.Consumer>
      {context => (
        <div className="section__wrapper">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Title</th>
              </tr>
            </thead>
            <tbody>
            {context.orders.map(order => {
              return (
                <tr key={order.id} onClick={() => context.editOrder(order)}>
                  <th scope="row">{order.id}</th>
                  <td>{context.orderEditing && context.orderId == order.id ? context.orderTitle : order.title}</td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      )}
    </OrdersContext.Consumer>
  )
}

export default Orders;
