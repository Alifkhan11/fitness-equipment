/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetProductsCheakOutQuery } from '@/redux/fetures/products/productsApi';
import { useCurrentProductsInfo } from '@/redux/fetures/products/productsSlice';
import { useAppSelector } from '@/redux/hooks';
import Loding from '@/utils/Loding';
import UserInfo from '../products/userinfo/UserInfo';
import { useCurrentUserInfo } from '@/redux/fetures/users/userSlice';
import {
  useGetUserInfoQuery,
  useGetUserQuery,
} from '@/redux/fetures/users/userApi';
import { RootState } from '@/redux/store';
import { useState } from 'react';
import PaymentCatchOn from '../payment/PaymentCatchOn';
import PaymentOnCard from '../payment/PaymentOnCard';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripepk = import.meta.env.VITE_SECRET_KEY;

const stripePromis: Promise<Stripe | null> = loadStripe(stripepk);

type TDeleveryProductInfo = {
  userName: string;
  userEmail: string;
  userPhone: number;
  userDivision: string;
  userDistric: string;
  userUpzala: string;
  userAddress: string;
  productsID: string[];
  quentity: unknown;
  totalPrice: number;
};

const CheakOut = () => {
  // const { ids, quentity } = useAppSelector(useCurrentProductsInfo);
  const { ids, quentity } = useAppSelector((state: RootState) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCurrentProductsInfo(state),
  ) as { ids: string[]; quentity: { [key: string]: number } };
  const { email } = useAppSelector(useCurrentUserInfo);
  const { data } = useGetProductsCheakOutQuery(ids);
  const { data: getuserinfo } = useGetUserInfoQuery({ email });
  const { data: getuser } = useGetUserQuery({ email });
  const [id, setId] = useState();

  const userId = getuser?.data?._id;
  const modelData = {
    userId,
    email,
  };

  if (!data) {
    return <Loding />;
  }
  if (!getuser) {
    return <Loding />;
  }
  if (!email) {
    return <Loding />;
  }

  const product = data?.data;

  // const shipping = Math.ceil(
  //   (product?.price / 100) * 2 * (quentity || 1) > 10
  //     ? (product?.price / 100) * 2 * (quentity || 1)
  //     : 10,
  // );
  // const productPrice = Math.ceil(
  //   product?.price - (product?.price / 100) * product?.discount,
  // );
  // const totalPrice = Math.ceil(
  //   (product?.price - (product?.price / 100) * product?.discount) *
  //     (quentity || 1),
  // );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const totalPrice=product.reduce((total:number,item:any)=>{
  //   console.log(item.price);

  //   return total+item.price*quentity[item._id]
  // })

  // console.log(totalPrice);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPrice = Math.ceil(
    product.reduce((total: any, item: any) => {
      const itemQuantity = quentity[item._id] || 1;
      const price = item.price - (item.price / 100) * item.discount;
      return total + price * itemQuantity;
    }, 0),
  );
  const shipping = Math.ceil(totalPrice / 200 < 10 ? 10 : totalPrice / 200);
  const idArray = product.map((item: any) => item.productID);

  const deleveryProductsInfo: TDeleveryProductInfo = {
    userName: `${getuser.data.firstName} ${getuser.data.lestName}`,
    userEmail: email,
    userPhone: getuserinfo?.data.phone,
    userDivision: getuserinfo?.data.division,
    userDistric: getuserinfo?.data.distric,
    userUpzala: getuserinfo?.data.upzala,
    userAddress: getuserinfo?.data.detailsAddress,
    productsID: idArray,
    totalPrice: totalPrice + shipping,
    quentity,
  };

  return (
    <div>
      <div className="grid grid-cols-12 gap-4 ">
        <div className="shadow-xl col-span-6 rounded-2xl">
          {getuserinfo ? (
            <>
              <div className="shadow-2xl m-5 p-5 rounded-2xl">
                <p className="text-3xl font-bold text-center mb-5">
                  {' '}
                  Shipping & Billing
                </p>

                <p className="flex justify-between mt-3 font-bold">
                  <span>Your Name : </span>
                  <span>
                    {getuser.data.firstName} {getuser.data.lestName}
                  </span>
                </p>
                <p className="flex justify-between mt-3 font-bold">
                  <span>Your Email : </span>
                  <span>{email}</span>
                </p>
                <p className="flex justify-between mt-3 font-bold">
                  <span>Your Phon Number : </span>
                  <span>{getuserinfo?.data.phone} </span>
                </p>
                <p className="flex justify-between mt-3 font-bold">
                  <span>Your dividion : </span>
                  <span>{getuserinfo?.data.division} </span>
                </p>
                <p className="flex justify-between mt-3 font-bold">
                  <span>Your distric : </span>
                  <span>{getuserinfo?.data.distric} </span>
                </p>
                <p className="flex justify-between mt-3 font-bold">
                  <span>Your upzela : </span>
                  <span>{getuserinfo?.data.upzala} </span>
                </p>
                <p className="flex justify-between mt-3 font-bold">
                  <span>Your address : </span>
                  <span>{getuserinfo?.data.detailsAddress} </span>
                </p>
              </div>

              <div className="m-5 p-5 shadow-2xl flex justify-between gap-5">
                <PaymentCatchOn deleveryProductsInfo={deleveryProductsInfo} />
                <Elements stripe={stripePromis}>
                  <PaymentOnCard
                    setId={setId}
                    deleveryProductsInfo={deleveryProductsInfo}
                  />
                </Elements>
              </div>
            </>
          ) : (
            <>
              <p>Please give Your addres</p>
              <UserInfo modalData={modelData} />
            </>
          )}
        </div>
        <div className="shadow-xl col-span-6 p-6  rounded-3xl">
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            product.map((products: any) => (
              <div className="flex" key={products._id}>
                <div className="flex justify-between items-center ">
                  <img width="100px" src={products?.image} alt="" />
                  <p> {product?.name} </p>
                  {/* <p> usd $ {productPrice}</p> */}
                </div>
                <div className="w-[30%] m-auto">
                  <h1>{products.name}</h1>
                </div>

                <div className="  mt-6">
                  <p>Qit : {quentity[products._id] || 1} </p>
                  <p>
                    {' '}
                    Price : ${' '}
                    {Math.ceil(
                      products.price -
                        (products.price / 100) * products.discount,
                    )}{' '}
                  </p>
                </div>

                <div className="m-auto">
                  <h1>
                    Total Price : ${' '}
                    {Math.ceil(
                      (products.price -
                        (products.price / 100) * products.discount) *
                        (quentity[products._id] || 1),
                    )}
                  </h1>
                </div>
              </div>
            ))
          }

          <div className="m-6 font-bold text-2xl">
            <div className="flex gap-5 justify-between mt-6">
              <p> Shipping </p>
              <p> $ {shipping} </p>
            </div>
            <div className="flex gap-5 justify-between mt-6">
              <p>Total Price </p>
              <p> $ {totalPrice} </p>
            </div>
          </div>
          {id ? (
            <p className="mt-16 text-2xl font-bold text-green-800 text-center">
              Payment id : {id}
            </p>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default CheakOut;
