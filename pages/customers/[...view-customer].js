// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { GET_CUSTOMER_BY_ID } from "@/Queries/Customers.js";
import { GET_ORDERS_BY_CUSTOMER } from "@/Queries/Orders.js";
import CapitalizeText from "@/Helpers/CapitalizeText.js";
import MuiPagination from "@/Components/MuiPagination/MuiPagination";
import ConfirmationModal from "@/Components/CustomerManagement/ConfirmationModal";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import theme from "@/mui/theme.js";
import useStyles from "@/Components/CustomerManagement/styles.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Modal from "@mui/material/Modal";
import { DataGrid } from "@mui/x-data-grid";

// ** Third Party Imports
import { useMutation } from "@apollo/client";
import { MdVisibility } from "react-icons/md";
import { FiShoppingBag } from "react-icons/fi";
import { GoRocket } from "react-icons/go";

export default function ViewCustomer() {
  const { classes } = useStyles();
  const router = useRouter();

  // Customer id
  const customerId = router.asPath.split("/")[3];

  // States
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(false);

  // Queries
  const [getCustomerById] = useMutation(GET_CUSTOMER_BY_ID, {
    onCompleted(data) {
      if (data.getCustomerById) {
        setCustomer(data.getCustomerById);
      }
    },
  });

  const [getOrdersByCustomer] = useMutation(GET_ORDERS_BY_CUSTOMER, {
    onCompleted(data) {
      if (data.getOrdersByCustomer) {
        setOrders(data.getOrdersByCustomer);
      }
    },
  });

  // Customers
  const customerData = useSelector((state) => state.customers.customers);

  useEffect(() => {
    if (customerId.length === 24) {
      if (customerData?.length > 0) {
        const customer = customerData.find((item) => {
          return item._id === customerId;
        });

        setCustomer(customer);
      } else {
        getCustomerById({ variables: { id: customerId } });
      }

      getOrdersByCustomer({ variables: { customerId } });
    }
  }, [customerId, customerData]);

  //Total quantity
  const totalQuantity = (products) => {
    const items = products.map((product) => product.quantity);

    return items.reduce((a, b) => {
      return a + b;
    }, 0);
  };

  //Total orders
  const totalOrders = orders.length;

  //Total spent
  const itemsTotal = [];

  orders?.map((order) => itemsTotal.push(order.totalAmount));

  const totalSpent = itemsTotal?.reduce((a, b) => {
    return a + b;
  }, 0);

  // Table columns
  const columns = [
    {
      field: "_id",
      headerName: "Order Id",
      width: 200,
    },
    {
      field: "totalAmount",
      headerName: "Amount",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Typography>
            {params.row.totalAmount}
            {process.env.NEXT_PUBLIC_STORE_CURRENCY}
          </Typography>
        );
      },
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <div>
            {params.row.paymentStatus === "paid" && (
              <Typography
                variant="body1"
                className={`${classes.chip} ${classes.paid}`}
              >
                {CapitalizeText(params.row.paymentStatus)}
              </Typography>
            )}
            {params.row.paymentStatus === "unpaid" && (
              <Typography
                variant="body1"
                className={`${classes.chip} ${classes.unPaid}`}
              >
                {CapitalizeText(params.row.paymentStatus)}
              </Typography>
            )}
          </div>
        );
      },
    },
    {
      field: "itemQuantity",
      headerName: "Quantity",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return <Typography>{totalQuantity(params.row.products)}</Typography>;
      },
    },
    {
      field: "dateOfPurchase",
      headerName: "Purchased On",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Typography>
            {new Date(params.row.dateOfPurchase).toLocaleDateString()}
          </Typography>
        );
      },
    },
    {
      field: "deliveryStatus",
      headerName: "Delivery Status",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <div>
            {params.row.deliveryStatus === "processing" && (
              <Typography
                variant="body1"
                className={`${classes.chip} ${classes.orderProcessing}`}
              >
                {CapitalizeText(params.row.deliveryStatus)}
              </Typography>
            )}
            {params.row.deliveryStatus === "shipped" && (
              <Typography
                variant="body1"
                className={`${classes.chip} ${classes.orderShipped}`}
              >
                {CapitalizeText(params.row.deliveryStatus)}
              </Typography>
            )}
            {params.row.deliveryStatus === "outForDelivery" && (
              <Typography
                variant="body1"
                className={`${classes.chip} ${classes.orderOutForDelivery}`}
              >
                {CapitalizeText(params.row.deliveryStatus)}
              </Typography>
            )}
            {params.row.deliveryStatus === "delivered" && (
              <Typography
                variant="body1"
                className={`${classes.chip} ${classes.orderDelivered}`}
              >
                {CapitalizeText(params.row.deliveryStatus)}
              </Typography>
            )}
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <>
            <Link href={"/orders/" + params.row._id}>
              <IconButton>
                <Tooltip title="View Order" arrow>
                  <span>
                    <MdVisibility />
                  </span>
                </Tooltip>
              </IconButton>
            </Link>
          </>
        );
      },
    },
  ];

  // To suspend the customer
  const handleSuspendCustomer = () => {
    setConfirmationModal(!confirmationModal);
  };

  return (
    <div className={classes.viewCustomer}>
      <Seo title={"View Customer"} />
      {customer && (
        <>
          <div className={classes.customerBasicDetails}>
            {customer.avatar?.includes("googleusercontent") ? (
              <Avatar src={customer.avatar} className={classes.avatar} />
            ) : (
              <Avatar
                src={
                  process.env.NEXT_PUBLIC_BACKEND_URL +
                  "profile/" +
                  customer.avatar
                }
                className={classes.avatar}
              />
            )}
            <Typography variant="h4" sx={{ mt: 1, opacity: 0.8 }}>
              {customer.firstName
                ? `@${CapitalizeText(customer.firstName)}`
                : customer.email}
            </Typography>
            <div className={classes.totalSpends}>
              <div>
                <FiShoppingBag className={classes.totalSpendsIcon} />
                <div>
                  <Typography variant="h3">{totalOrders}</Typography>
                  <Typography variant="h6">Total Orders</Typography>
                </div>
              </div>
              <div>
                <GoRocket className={classes.totalSpendsIcon} />
                <div>
                  <Typography variant="h3">{totalSpent}</Typography>
                  <Typography variant="h6">Total Spent</Typography>
                </div>
              </div>
            </div>
          </div>
          {/* User Details */}
          <div className={classes.customerDetails}>
            <Table>
              <TableBody>
                {customer.firstName && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Name</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {customer.firstName + " " + customer.lastName}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.email && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Email</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{customer.email}</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.phoneNumber && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Phone Number</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {customer.phoneNumber}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.gender && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Gender</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">{customer.gender}</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.dob && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Dob</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {new Date(customer.dob).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.address && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Address</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        <span>
                          {customer.address.address1},{" "}
                          {customer.address.address2},{" "}
                        </span>
                        <span>{customer.address.city}, </span>
                        <span>{customer.address.state}, </span>
                        <span>{customer.address.country} - </span>
                        <span>{customer.address.postal_code}</span>
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.joinedOn && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6"> Joined On</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {new Date(customer.joinedOn).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {customer.customerStatus && (
                  <TableRow>
                    <TableCell component="th" scope="row">
                      <Typography variant="h6">Status</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        {CapitalizeText(customer.customerStatus)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Recent orders */}
          <div className={classes.recentOrders}>
            <Typography variant="h4" sx={{ mb: 4 }}>
              {customer.firstName || "Customer's "} Recent Orders:
            </Typography>
            {Array.isArray(orders) && (
              <DataGrid
                className={classes.table}
                rows={orders}
                columns={columns}
                getRowId={(row) => row._id}
                pageSize={6}
                density="comfortable"
                autoHeight={true}
                headerHeight={60}
                rowHeight={60}
                components={{
                  NoRowsOverlay: () => (
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      No orders found
                    </Stack>
                  ),
                  NoResultsOverlay: () => (
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      No orders found
                    </Stack>
                  ),
                  Pagination: MuiPagination,
                }}
              />
            )}
          </div>
          <div className={classes.customerActions}>
            <Typography variant="h4">Suspend a customer:</Typography>
            <PrimaryButton
              text={
                customer.customerStatus === "active" ? "suspend" : "activate"
              }
              onClick={handleSuspendCustomer}
              style={{
                backgroundColor: `${
                  customer.customerStatus === "active"
                    ? theme.palette.error.light
                    : theme.palette.success.light
                } !important`,
                marginLeft: "20px",
              }}
            />
          </div>
          {/* Confirmation Modal */}
          <Modal open={confirmationModal}>
            <ConfirmationModal
              id={customer._id}
              email={customer.email}
              action={customer.customerStatus}
              closeModal={handleSuspendCustomer}
            />
          </Modal>
        </>
      )}
    </div>
  );
}

export { getServerSideProps };
