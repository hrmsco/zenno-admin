// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GET_COUPONS, DELETE_COUPON } from "@/Queries/Coupons.js";
import { getCoupons, removeCoupon } from "@/Redux/slices/coupons.js";
import AddCoupon from "@/Components/Coupons/AddCoupon";
import MuiPagination from "@/Components/MuiPagination/MuiPagination";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyes from "@/Components/Coupons/styles.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";

// ** Third Party Imports
import { useQuery, useMutation } from "@apollo/client";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";

export default function Coupons() {
  const { classes } = useStyes();
  const dispatch = useDispatch();

  // States
  const [coupons, setCoupons] = useState([]);
  const [modal, setModal] = useState(false);
  const [couponId, setCouponId] = useState(null);

  // Queries
  const couponsQuery = useQuery(GET_COUPONS);

  // coupons
  const couponsData = useSelector((state) => state.coupons.coupons);

  useEffect(() => {
    const coupons = couponsQuery?.data?.getCoupons;

    if (coupons && couponsData?.length === 0) {
      dispatch(getCoupons(coupons));
    }

    setCoupons(couponsData);
  }, [couponsQuery, couponsData]);

  // Table columns
  const columns = [
    {
      field: "couponCode",
      headerName: "Coupon Code",
      width: 250,
      renderCell: (params) => {
        return (
          <Typography variant="h6" className={classes.couponCode}>
            {params.row.couponCode}
          </Typography>
        );
      },
    },
    {
      field: "validFrom",
      headerName: "Valid From",
      width: 150,
      renderCell: (params) => {
        var date = new Date(params.row.validFrom);
        return date.toLocaleDateString();
      },
    },
    {
      field: "validTo",
      headerName: "Valid To",
      width: 150,
      renderCell: (params) => {
        var date = new Date(params.row.validTo);
        return date.toLocaleDateString();
      },
    },
    {
      field: "limitPerUser",
      headerName: "Limit Per User",
      width: 200,
      align: "center",
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <div>
            <IconButton>
              <Tooltip title="Edit Coupon" arrow>
                <span>
                  <FiEdit2 onClick={() => handleCouponEdit(params.row._id)} />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton>
              <Tooltip title="Delete Coupon" arrow>
                <span>
                  <AiOutlineDelete
                    onClick={() => handleCouponDelete(params.row._id)}
                  />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        );
      },
    },
  ];

  // To edit a coupon
  const handleCouponEdit = (id) => {
    setCouponId(id);
    setModal(!modal);
  };

  // To delete  a coupon
  const handleCouponDelete = (couponId) => {
    deleteCoupon({ variables: { id: couponId } });
  };

  // Deleting the coupon
  const [deleteCoupon] = useMutation(DELETE_COUPON, {
    onCompleted(data) {
      if (data.deleteCoupon.status === 200) {
        ToastStatus("Success", data.deleteCoupon.message);
        dispatch(removeCoupon(couponId));
      } else {
        ToastStatus("Error", "Error occurred");
      }
    },
  });

  // Handle open & close of add / edit coupon modal
  const handleModal = () => {
    setModal(!modal);

    if (modal) {
      setCouponId(null);
    }
  };

  return (
    <div className={classes.tableContainer}>
      <Seo title={"Coupons"} />
      <Toaster />
      <div className={classes.tableTop}>
        <Typography variant="h4">All Coupons</Typography>
        <PrimaryButton text="Add Coupon" onClick={handleModal} />
      </div>
      {Array.isArray(coupons) && (
        <DataGrid
          className={classes.table}
          rows={coupons}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={6}
          density="comfortable"
          autoHeight={true}
          headerHeight={60}
          rowHeight={60}
          components={{
            NoRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No coupons found
              </Stack>
            ),
            NoResultsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No coupons found
              </Stack>
            ),
            Pagination: MuiPagination,
          }}
        />
      )}
      {/* Coupon edit modal */}
      <Modal open={modal} onClose={handleModal}>
        <AddCoupon id={couponId} modal={handleModal} />
      </Modal>
    </div>
  );
}

export { getServerSideProps };
