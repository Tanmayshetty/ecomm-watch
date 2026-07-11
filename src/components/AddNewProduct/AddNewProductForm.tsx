import { useState } from 'react';
const AddNewProductForm = () => {
  const [formData, setFormData] = useState({
    url: '',
    type: 'Fans',
    priceNotify: '',
    header: '',
  });
  const onProductDataChange = (event: React.FormEvent<EventTarget>) => {
    const { name, value } = event.target as HTMLInputElement;
    setFormData({ ...formData, [name]: value });
  };
  const addProductAPICall = async (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    const APIURL = '/api/addProduct';
    const rawResponse = await fetch(APIURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    await rawResponse.json();
    // @ts-expect-error document ref
    document.getElementById('addNewProductModal').close();
  };

  return (
    <form method='POST' onSubmit={addProductAPICall}>
      <label className='form-control w-full max-w-xs pb-4'>
        <div className='label'>
          <span className='label-text'>Product URL</span>
        </div>
        <input
          type='text'
          name='url'
          placeholder='Type here'
          className='input input-bordered w-full max-w-xs'
          onChange={onProductDataChange}
          value={formData.url}
        />
      </label>
      <label className='form-control w-full max-w-xs pb-4'>
        <div className='label'>
          <span className='label-text'>Product Header</span>
        </div>
        <input
          type='text'
          name='header'
          placeholder='Type here'
          className='input input-bordered w-full max-w-xs'
          onChange={onProductDataChange}
          value={formData.header}
        />
      </label>
      <label className='form-control w-full max-w-xs pb-4'>
        <div className='label'>
          <span className='label-text'>Product Type </span>
        </div>
        <select
          className='select select-bordered'
          name='type'
          onChange={onProductDataChange}
          defaultValue={formData.type}
        >
          <option>Fans</option>
          <option>Routers</option>
          <option>Laptop</option>
          <option>Locker</option>
          <option>Microwave Ovens</option>
          <option>Phone</option>
          <option>Geaser</option>
          <option>Mixer</option>
          <option>Mattress</option>
          <option>Chimney</option>
          <option>Water Purifier</option>
          <option>Furniture</option>
          <option>Monitor</option>
          <option>Chair</option>
          <option>Shoe</option>
          <option>Stove</option>
          <option>Mirror</option>
          <option>Normal Mirror</option>
          <option>Ceiling Lamps</option>
          <option>Kitchen Sinks</option>
          <option>Wash Basins</option>
          <option>Stabiliser</option>
          <option>Locker</option>
          <option>Refrigerator</option>
          <option>TV</option>
          <option>HeadPhone</option>
          <option>Clock</option>
          <option>Other</option>
        </select>
      </label>
      <label className='form-control w-full max-w-xs pb-4'>
        <div className='label'>
          <span className='label-text'>Product Price Notify</span>
        </div>
        <input
          type='number'
          placeholder='Type here'
          className='input input-bordered w-full max-w-xs'
          name='priceNotify'
          onChange={onProductDataChange}
          value={formData.priceNotify}
        />
      </label>
      <button className='btn mr-8' type='submit'>
        Submit
      </button>
      {/* if there is a button in form, it will close the modal */}
      <button
        className='btn'
        type='button'
        onClick={() => {
          // @ts-expect-error document ref
          document.getElementById('addNewProductModal').close();
        }}
      >
        Close
      </button>
    </form>
  );
};

export default AddNewProductForm;
