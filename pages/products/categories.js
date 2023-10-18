// ** Next, React And Locals Imports
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GET_PRODUCT_SETTINGS,
  PRODUCT_SETTINGS,
} from "@/Queries/ProductSettings.js";
import {
  getProductSettings,
  editProductSettings,
} from "@/Redux/slices/productSettings.js";
import { FormTextField } from "@/Helpers/FormFields.js";
import {
  composeValidators,
  isText,
  isRequired,
} from "@/Helpers/FormValidators.js";
import CapitalizeText from "@/Helpers/CapitalizeText.js";
import MuiPagination from "@/Components/MuiPagination/MuiPagination";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/styles/product-categories.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";

// ** Third Party Imports
import { Form, Field } from "react-final-form";
import { useMutation, useQuery } from "@apollo/client";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";

export default function ProductCategories() {
  const dispatch = useDispatch();
  const { classes } = useStyles();

  // States
  const [category, setCategory] = useState("");

  const initialValue = {
    category,
  };

  // Queries
  const productSettingsQuery = useQuery(GET_PRODUCT_SETTINGS);

  useEffect(() => {
    const productSettingsData = productSettingsQuery?.data?.getProductSettings;

    if (productSettingsData) {
      dispatch(getProductSettings(productSettingsData));
      setCategory("");
    }
  }, [productSettingsQuery]);

  // Product settings (categories)
  const productSettings = useSelector(
    (state) => state.productSettings.productSettings
  );

  const categories = productSettings?.categories;

  // To handle category add or edit
  const submit = (values) => {
    if (category.length > 1) {
      const filteredCategories = categories
        ? categories.filter((item) => {
            return item !== category;
          })
        : [];

      filteredCategories.push(values.category.toLowerCase());

      const valuesObject = {
        id: productSettings._id,
        categories: filteredCategories,
      };
      productCategories({ variables: valuesObject });
    } else {
      const categoriesList = categories ? [...categories] : [];

      categoriesList.push(values.category.toLowerCase());

      const valuesObject = {
        id: productSettings._id,
        categories: categoriesList,
      };

      productCategories({ variables: valuesObject });
    }
  };

  // Edit category
  const handleEdit = (row) => {
    setCategory(row);
  };

  // Delete category
  const handleDelete = (row) => {
    const filteredCategories = categories.filter((category) => {
      return category !== row;
    });

    const valuesObject = {
      id: productSettings._id,
      categories: filteredCategories,
    };

    productCategories({ variables: valuesObject });
  };

  const [productCategories, { loading }] = useMutation(PRODUCT_SETTINGS, {
    onCompleted(data) {
      if (data.productSettings.status === 200) {
        dispatch(editProductSettings(data.productSettings));
        setCategory("");

        ToastStatus("Success", data.productSettings.message);
      } else {
        ToastStatus("Error", "Error occurred");
      }
    },
  });

  // Table columns
  const columns = [
    {
      field: "categoryName",
      headerName: "Category Name",
      width: 300,
      renderCell: (params) => {
        return CapitalizeText(params.row);
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <div>
            <IconButton>
              <Tooltip title="Edit Category" arrow>
                <span>
                  <FiEdit2 onClick={() => handleEdit(params.row)} />
                </span>
              </Tooltip>
            </IconButton>
            <IconButton>
              <Tooltip title="Delete Category" arrow>
                <span>
                  <AiOutlineDelete onClick={() => handleDelete(params.row)} />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        );
      },
    },
  ];

  return (
    <Paper className={classes.tableContainer}>
      <Seo title={"Product Categories"} />
      <Toaster />
      <Form onSubmit={submit} initialValues={initialValue}>
        {({ handleSubmit, invalid }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Typography variant="h4">Add Product Category:</Typography>
            <div className={classes.formFields}>
              <div className={classes.formField}>
                <Field
                  name="category"
                  component={FormTextField}
                  validate={composeValidators(isRequired, isText)}
                  label="Product Category"
                />
              </div>
              <div className={classes.actionBtn}>
                <PrimaryButton
                  type="submit"
                  text={category ? "Update" : "Add"}
                  disabled={invalid}
                  spinner={loading}
                />
              </div>
            </div>
          </form>
        )}
      </Form>
      <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>
        Current Categories:
      </Typography>
      {Array.isArray(categories) && (
        <DataGrid
          className={classes.table}
          rows={categories}
          columns={columns}
          getRowId={(row) => row}
          pageSize={5}
          density="comfortable"
          autoHeight={true}
          headerHeight={60}
          rowHeight={60}
          components={{
            NoRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No categories found
              </Stack>
            ),
            NoResultsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No categories found
              </Stack>
            ),
            Pagination: MuiPagination,
          }}
        />
      )}
    </Paper>
  );
}

export { getServerSideProps };
