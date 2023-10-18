// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import { GET_COUNT } from "@/Queries/Count.js";
import { PRODUCTS_SOLD } from "@/Queries/Orders.js";
import { GET_NEW_PRODUCTS, OUT_OF_STOCK_PRODUCTS } from "@/Queries/Products.js";
import {
  GET_NEW_CUSTOMERS,
  GET_SUSPENDED_CUSTOMERS,
} from "@/Queries/Customers.js";
import WelcomeBanner from "@/Components/Dashboard/WelcomeBanner/WelcomeBanner";
import TotalRevenue from "@/Components/Dashboard/TotalRevenue/TotalRevenue";
import TotalOrders from "@/Components/Dashboard/TotalOrders/TotalOrders";
import MonthlyEarnings from "@/Components/Dashboard/MonthlyEarnings/MonthlyEarnings";
import MonthlyOrders from "@/Components/Dashboard/MonthlyOrders/MonthlyOrders";
import WeeklyOrders from "@/Components/Dashboard/WeeklyOrders/WeeklyOrders";
import TinyWidget from "@/Components/Dashboard/TinyWidgets/TinyWidgets";
import TotalCustomers from "@/Components/Dashboard/TotalCustomers/TotalCustomers";
import RecentOrders from "@/Components/Dashboard/RecentOrders/RecentOrders";
import Seo from "@/Components/Seo/Seo";
import theme from "@/mui/theme.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Grid from "@mui/material/Grid";

// ** Third Party Imports
import { useQuery } from "@apollo/client";

export default function Dashboard() {
  // Total Products
  const [totalProducts, setTotalProducts] = useState(0);

  const { data: totalProductsQuery } = useQuery(GET_COUNT, {
    variables: { model: "products" },
  });

  const totalProductsData = {
    title: "Total Products",
    color: theme.palette.success.main,
    total: totalProducts,
    icon: "/assets/totalProducts.png",
  };

  // Products Sold
  const [productsSold, setProductsSold] = useState(0);

  const { data: productsSoldQuery } = useQuery(PRODUCTS_SOLD);

  const productsSoldData = {
    title: "Products Sold",
    color: theme.palette.primary.main,
    total: productsSold,
    icon: "/assets/totalProductsSold.png",
  };

  // Out Of Stock
  const [stockProducts, setStockProducts] = useState(0);

  const { data: outOfStockProductsQuery } = useQuery(OUT_OF_STOCK_PRODUCTS);

  const outOfStockData = {
    title: "Out Of Stock",
    color: theme.palette.primary.main,
    total: stockProducts,
    icon: "/assets/outOfStock.png",
  };

  // New Products
  const [newProducts, setNewProducts] = useState(0);

  const { data: newProductsQuery } = useQuery(GET_NEW_PRODUCTS);

  const newProductsData = {
    title: "New Products",
    color: theme.palette.success.main,
    total: newProducts,
    icon: "/assets/totalProducts.png",
  };

  // New Customers
  const [newCustomers, setNewCustomers] = useState(0);

  const { data: newCustomersQuery } = useQuery(GET_NEW_CUSTOMERS);

  const newCustomersData = {
    title: "New Customers",
    color: theme.palette.success.light,
    total: newCustomers,
    icon: "/assets/newUser.png",
  };

  // Suspended Customers
  const [suspendedCustomers, setSuspendedCustomers] = useState(0);

  const { data: suspendedCustomersQuery } = useQuery(GET_SUSPENDED_CUSTOMERS);

  const suspendedCustomersData = {
    title: "Suspended Customers",
    color: theme.palette.error.main,
    total: suspendedCustomers,
    icon: "/assets/suspendedUser.png",
  };

  useEffect(() => {
    const totalProducts = totalProductsQuery?.getCount?.count;
    const productsSold = productsSoldQuery?.getSoldProducts;
    const outOfStockProducts =
      outOfStockProductsQuery?.getOutOfStockProducts?.length;
    const newProducts = newProductsQuery?.getNewProducts?.length;
    const newCustomers = newCustomersQuery?.getNewCustomers?.length;
    const suspendedCustomers =
      suspendedCustomersQuery?.getSuspendedCustomers?.length;

    if (totalProducts) {
      setTotalProducts(totalProducts);
    }

    if (productsSold) {
      const productsArray = [];
      const productsQuantity = [];

      productsSold.map((item) => productsArray.push(...item.products));

      productsArray.map((item) => productsQuantity.push(item.quantity));

      const totalSoldProducts = productsQuantity.reduce((a, b) => {
        return a + b;
      }, 0);

      setProductsSold(totalSoldProducts);
    }

    if (outOfStockProducts) {
      setStockProducts(outOfStockProducts);
    }

    if (newProducts) {
      setNewProducts(newProducts);
    }

    if (newCustomers) {
      setNewCustomers(newCustomers);
    }

    if (suspendedCustomers) {
      setSuspendedCustomers(suspendedCustomers);
    }
  }, [
    totalProductsQuery,
    productsSoldQuery,
    outOfStockProductsQuery,
    newProductsQuery,
    newCustomersQuery,
    suspendedCustomersQuery,
  ]);

  return (
    <div>
      <Seo title={"Dashboard"} />
      <Grid container spacing={5}>
        <Grid item md={12} lg={4}>
          <WelcomeBanner />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <TotalRevenue />
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <TotalOrders />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
          <MonthlyEarnings />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6} lg={12}>
              <MonthlyOrders />
            </Grid>
            <Grid item xs={12} sm={6} lg={12}>
              <WeeklyOrders />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6} lg={6}>
              <TinyWidget data={totalProductsData} />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <TinyWidget data={productsSoldData} />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <TinyWidget data={newProductsData} />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <TinyWidget data={outOfStockData} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} md={12} lg={6} xl={4}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12}>
              <TotalCustomers />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6} lg={6}>
                  <TinyWidget data={newCustomersData} />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <TinyWidget data={suspendedCustomersData} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={8}>
          <RecentOrders />
        </Grid>
      </Grid>
    </div>
  );
}

export { getServerSideProps };
