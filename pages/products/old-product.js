// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { GET_PRODUCT_SETTINGS } from "@/Queries/ProductSettings.js";
import { PRODUCTS, GET_PRODUCTS_BY_IDS } from "@/Queries/Products.js";
import { addProduct, editProduct } from "@/Redux/slices/products.js";
import {
  FormTextField,
  FormTextFieldAdorn,
  FormSelectField,
} from "@/Helpers/FormFields.js";
import {
  composeValidators,
  isNumbers,
  isRequired,
} from "@/Helpers/FormValidators.js";
import CapitalizeText from "@/Helpers/CapitalizeText.js";
import ReactDraft from "@/Components/ReactDraft/ReactDraft";
import DropzoneMultiple from "@/Components/Products/DropzoneMultiple";
import Dropzone3d from "@/Components/Products/Dropzone3d";
import MuiSwitch from "@/Components/MuiSwitch/MuiSwitch";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/Components/Products/styles.js";
import theme from "@/mui/theme.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

// ** Third party imports
import { Field, Form } from "react-final-form";
import { useMutation, useQuery } from "@apollo/client";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import { GrAddCircle } from "react-icons/gr";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { CgUnavailable } from "react-icons/cg";

export default function CreateProduct() {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();

  // States
  const [product, setProduct] = useState(null);
  const [productType, setProductType] = useState("");
  const [categories, setCategories] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [options, setOptions] = useState({});
  const [variants, setVariants] = useState([]);
  const [variantsOptions, setVariantsOptions] = useState([]);
  const [availability, setAvailability] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});

  // Product id
  const productId =
    router.asPath.split("/")[3]?.length === 24
      ? router.asPath.split("/")[3]
      : null;

  // Variant options max limit
  const FIELDS_MAX_LIMIT = 2;

  // Product types
  const productTypes = [
    {
      label: "Simple product",
      value: "simple",
    },
    {
      label: "Variable product",
      value: "variable",
    },
    {
      label: "3D product",
      value: "3d",
    },
  ];

  // Queries
  const productSettingsQuery = useQuery(GET_PRODUCT_SETTINGS);

  const [getProductsByIds] = useMutation(GET_PRODUCTS_BY_IDS, {
    onCompleted(data) {
      if (data.getProductsByIds.length > 0) {
        setProduct(data.getProductsByIds[0]);
      } else {
        router.push("/shop");
      }
    },
  });

  // Product data
  const productsData = useSelector((state) => state.products.products);

  useEffect(() => {
    if (productId?.length === 24) {
      if (productsData.length > 0) {
        const product = productsData.find((product) => {
          return product._id === productId;
        });

        setProduct(product);
      } else {
        getProductsByIds({ variables: { ids: [productId] } });
      }
    }
  }, [productId, productsData]);

  // Initializing the fields
  useEffect(() => {
    if (product?.variantsOptions?.length > 0) {
      const variantsOptions = product.variantsOptions;

      const variantNames = variantsOptions.map((variant) => variant.name);

      const selectedOptions = variantsOptions.map((variant) => variant.options);

      const variantNamesObject = Object.assign(
        {},
        ...variantNames.map((name, index) => ({ [index]: name }))
      );

      const selectedOptionsObject = Object.assign(
        {},
        ...selectedOptions.map((options, index) => ({ [index]: options }))
      );

      setSelectedVariants(variantNamesObject);

      setSelectedOptions(selectedOptionsObject);
    }

    if (product?.productType) {
      setProductType(product.productType);
    }

    if (product?.productType === "variable") {
      const availability = {};

      product.variants?.map((variant, index) => {
        availability[index] = variant.inStock;
      });

      setAvailability(availability);
    } else {
      // Simple product
      const availability = {};

      availability[0] = product?.inStock === true ? 1 : 0;

      setAvailability(availability);
    }
  }, [product]);

  useEffect(() => {
    const categoriesArray =
      productSettingsQuery?.data?.getProductSettings?.categories;

    const variantArray =
      productSettingsQuery?.data?.getProductSettings?.variants;

    if (categoriesArray?.length > 0) {
      const categories = [];

      categoriesArray.map((category) => {
        return categories.push({
          value: category,
        });
      });

      setCategories(categories);
    }

    if (variantArray?.length > 0) {
      setProductVariants(variantArray);
    }
  }, [productSettingsQuery]);

  useEffect(() => {
    // Setting variant options
    if (productType === "variable") {
      if (product) {
        setVariantsOptions(product?.variantsOptions);
      } else {
        setVariantsOptions([{ name: "", option: "" }]);
      }
    }
  }, [productType]);

  useEffect(() => {
    if (
      productVariants.length > 0 &&
      Object.values(selectedVariants).length > 0
    ) {
      Object.values(selectedVariants).map((variantName, index) => {
        const productVariant = productVariants.find((productVariant) => {
          return productVariant.name === variantName;
        });

        const options =
          productVariant?.options?.map((option) => ({
            variantId: option._id,
            value: option.value,
            meta: option.meta,
          })) || [];

        setOptions((prevOptions) => ({
          ...prevOptions,
          [index]: options,
        }));

        const updatedSelectedOptions = Object.keys(selectedOptions).reduce(
          (result, key) => {
            const filteredOptions = selectedOptions[key]?.filter((option) =>
              options.some((o) => o.value === option.value)
            );

            if (filteredOptions.length > 0) {
              result[key] = filteredOptions;
            }

            return result;
          },
          {}
        );

        setSelectedOptions((prevSelectedOptions) => ({
          ...prevSelectedOptions,
          ...updatedSelectedOptions,
        }));
      });
    }
  }, [productVariants, JSON.stringify(selectedVariants)]);

  useEffect(() => {
    if (Object.values(selectedOptions).length === 2) {
      const variants = [];

      selectedOptions[0].forEach((item1) => {
        selectedOptions[1].forEach((item2) => {
          const variantName = `${item1.value}/${item2.value}`;
          const variantsId = [item1.variantId, item2.variantId];

          // Check if variantsId exists in product variants
          const variantEntry = product?.variants.find((entry) =>
            variantsId.every((id) => entry.variantsId.includes(id))
          );

          if (variantEntry) {
            // Variant entry found in variantsArray, push title along with variantsId and variantName
            variants.push({
              ...variantEntry,
            });
          } else {
            // Variant entry not found, push variantsId and variantName only
            variants.push({
              variantName,
              variantsId,
            });
          }
        });
      });

      setVariants(variants);
    }
  }, [selectedOptions]);

  // To handle stocks change
  const handleInStock = (index, checked) => {
    setAvailability((prevValues) => ({
      ...prevValues,
      [index]: checked ? 1 : 0,
    }));
  };

  // To handle product type change
  const handleProductTypeChange = (value) => {
    setProductType(value);
  };

  // To get variant names only from variants
  const GetVariantsName = (productVariants) => {
    const variantsName = [];

    productVariants.forEach((productVariant) => {
      variantsName.push({
        value: productVariant.name,
      });
    });

    return variantsName || [];
  };

  // To handle auto complete field change
  const handleAutocompleteChange = (index, values) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [index]: values,
    }));
  };

  // Render the form fields based on product type
  const renderFields = (name, index) => {
    return (
      <>
        <div className={classes.formFields}>
          <div className={classes.formField}>
            <Field
              name={name === "simpleProduct" ? "images" : `${name}.images`}
              validate={isRequired}
            >
              {(props) => (
                <DropzoneMultiple
                  {...props.input}
                  index={index}
                  text="Recommended size: 660 x 770px"
                />
              )}
            </Field>
          </div>
        </div>
        <div className={classes.formFields}>
          <div className={classes.formField}>
            <Field
              name={
                name === "simpleProduct"
                  ? "regularPrice"
                  : `${name}.regularPrice`
              }
              component={FormTextFieldAdorn}
              adornment="€"
              validate={composeValidators(isRequired, isNumbers)}
              label="Regular Price"
            />
          </div>
          <div className={classes.formField}>
            <Field
              name={
                name === "simpleProduct" ? "salePrice" : `${name}.salePrice`
              }
              component={FormTextFieldAdorn}
              adornment="€"
              validate={composeValidators(isRequired, isNumbers)}
              label="Sale Price"
              helperText={"Should be lower than or equal to regular price"}
            />
          </div>
          <div className={classes.formField}>
            <Field
              name={name === "simpleProduct" ? "tax" : `${name}.tax`}
              component={FormTextFieldAdorn}
              adornment={"%"}
              position={"end"}
              validate={composeValidators(isRequired, isNumbers)}
              label="Tax"
            />
          </div>
        </div>
        <div className={classes.formFields}>
          <div className={`${classes.formField} ${classes.stockToggle}`}>
            <Typography sx={{ pr: 3 }} variant="h5">
              Enable / Disable Stock:
            </Typography>
            <MuiSwitch
              checked={availability[index] > 0}
              onClick={(e) => handleInStock(index, e.target.checked)}
            />
          </div>
          <div className={classes.formField}>
            <Field
              name={
                name === "simpleProduct" ? "totalStocks" : `${name}.totalStocks`
              }
              component={FormTextField}
              validate={composeValidators(isNumbers, isRequired)}
              label="Total Stocks"
            />
          </div>
        </div>
      </>
    );
  };

  // Render the form fields based on product type
  const renderFields3d = (name, index) => {
    return (
      <>
        <div className={classes.formFields}>
          <div className={classes.formField}>
            <Field
              name={name === "modelThreeD" ? "images" : `${name}.images`}
              validate={isRequired}
            >
              {(props) => (
                <Dropzone3d
                  {...props.input}
                  index={index}
                  text="Recommended size: 660 x 770px"
                />
              )}
            </Field>
          </div>
        </div>
        <div className={classes.formFields}>
          <div className={classes.formField}>
            <Field
              name={
                name === "modelThreeD" ? "thumbnails" : `${name}.thumbnails`
              }
              validate={isRequired}
            >
              {(props) => (
                <DropzoneMultiple
                  {...props.input}
                  index={index}
                  text="Recommended size: 660 x 770px"
                />
              )}
            </Field>
          </div>
        </div>
        <div className={classes.formFields}>
          <div className={classes.formField}>
            <Field
              name={
                name === "modelThreeD" ? "regularPrice" : `${name}.regularPrice`
              }
              component={FormTextFieldAdorn}
              adornment="€"
              validate={composeValidators(isRequired, isNumbers)}
              label="Regular Price"
            />
          </div>
          <div className={classes.formField}>
            <Field
              name={name === "modelThreeD" ? "salePrice" : `${name}.salePrice`}
              component={FormTextFieldAdorn}
              adornment="€"
              validate={composeValidators(isRequired, isNumbers)}
              label="Sale Price"
              helperText={"Should be lower than or equal to regular price"}
            />
          </div>
          <div className={classes.formField}>
            <Field
              name={name === "modelThreeD" ? "tax" : `${name}.tax`}
              component={FormTextFieldAdorn}
              adornment={"%"}
              position={"end"}
              validate={composeValidators(isRequired, isNumbers)}
              label="Tax"
            />
          </div>
        </div>
        <div className={classes.formFields}>
          <div className={`${classes.formField} ${classes.stockToggle}`}>
            <Typography sx={{ pr: 3 }} variant="h5">
              Enable / Disable Stock:
            </Typography>
            <MuiSwitch
              checked={availability[index] > 0}
              onClick={(e) => handleInStock(index, e.target.checked)}
            />
          </div>
          <div className={classes.formField}>
            <Field
              name={
                name === "modelThreeD" ? "totalStocks" : `${name}.totalStocks`
              }
              component={FormTextField}
              validate={composeValidators(isNumbers, isRequired)}
              label="Total Stocks"
            />
          </div>
        </div>
      </>
    );
  };

  // To handle product add or edit
  const submit = (values) => {
    // Values needs to convert to float from string
    const convertToFloatValues = [
      "regularPrice",
      "salePrice",
      "tax",
      "totalStocks",
      "inStock",
    ];

    // Function to convert string to float
    const convertToFloat = (object) => {
      const parsedObject = Object.fromEntries(
        Object.entries(object).map(([key, value]) => {
          if (convertToFloatValues.includes(key)) {
            return [key, parseFloat(value)]; // Parse the remaining key-value pairs
          }

          return [key, value]; // Excluded keys
        })
      );

      return parsedObject;
    };

    if (values.productType === "simple") {
      let valuesObject;
      console.log("values simple", values);
      if (values.simpleProduct) {
        // Adding the single product
        valuesObject = {
          id: values._id || null,
          title: values.title,
          desc: values.desc,
          category: values.category.toLowerCase(),
          productType: values.productType,
          ...convertToFloat(values.singleProduct),
          inStock: availability["0"] === 1 ? true : false,
        };
      } else {
        // Editing the single product
        const unParsedObject = {
          id: values._id || null,
          title: values.title,
          desc: values.desc,
          category: values.category.toLowerCase(),
          productType: values.productType,
          images: values.images,
          thumbnails: values.thumbnails,
          regularPrice: values.regularPrice,
          salePrice: values.salePrice,
          tax: values.tax,
          totalStocks: values.totalStocks,
        };

        valuesObject = {
          ...convertToFloat(unParsedObject),
          inStock: availability["0"] === 1 ? true : false,
        };
      }

      if (valuesObject.images.length > 6) {
        ToastStatus("Error", "Only six images are allowed");
      } else {
        console.log("valuesObject", valuesObject);
        products({ variables: valuesObject });
      }
    } else if (values.productType === "3d") {
      let valuesObject;
      console.log("values 3D", values);
      if (values.modelThreeD) {
        // Adding the single product
        valuesObject = {
          id: values._id || null,
          title: values.title,
          desc: values.desc,
          category: values.category.toLowerCase(),
          productType: values.productType,
          ...convertToFloat(values.singleProduct),
          inStock: availability["0"] === 1 ? true : false,
        };
      } else {
        // Editing the single product
        const unParsedObject = {
          id: values._id || null,
          title: values.title,
          desc: values.desc,
          category: values.category.toLowerCase(),
          productType: values.productType,
          images: values.images,
          thumbnails: values.thumbnails,
          regularPrice: values.regularPrice,
          salePrice: values.salePrice,
          tax: values.tax,
          totalStocks: values.totalStocks,
        };

        valuesObject = {
          ...convertToFloat(unParsedObject),
          inStock: availability["0"] === 1 ? true : false,
        };

        console.log("valuesObject", valuesObject);
      }

      if (valuesObject.images.length > 6) {
        ToastStatus("Error", "Only six images are allowed");
      } else {
        products({ variables: valuesObject });
      }
    } else {
      // Variable product
      const removeTypename = (array) => {
        return array.map(({ __typename, ...rest }) => rest);
      };

      const variantsOptions = values.variantsOptions.map((item, index) => ({
        name: item.name,
        options: removeTypename(selectedOptions[index]),
      }));

      const parsedVariants = values.variants.map((variant, index) => {
        const inStockValue = availability[index] === 1 ? true : false;

        return { ...convertToFloat(variant), inStock: inStockValue };
      });

      const valuesObject = {
        id: values._id || null,
        title: values.title,
        desc: values.desc,
        category: values.category.toLowerCase(),
        productType: values.productType,
        variantsOptions,
        variants: removeTypename(parsedVariants),
      };

      let hasError = false;

      valuesObject.variants.forEach((variant) => {
        if (variant.images.length > 6) {
          hasError = true;
          ToastStatus("Error", "Only six images are allowed");
        }
      });

      if (!hasError) {
        products({ variables: valuesObject });
      }
    }
  };

  // Add / edit product
  const [products, { loading }] = useMutation(PRODUCTS, {
    onCompleted(data) {
      if (data.products.status === 200) {
        productId
          ? dispatch(editProduct(data.products))
          : dispatch(addProduct(data.products));

        ToastStatus("Success", data.products.message);

        setTimeout(() => {
          router.push("/products/all");
        }, [1500]);
      } else {
        ToastStatus("Error", data.products.message);
      }
    },
  });

  useEffect(() => {
    if (product) {
      console.log("product", product);
      console.log("productType", productType);
    }
  }, [product, productType]);

  return (
    <Paper className={classes.form}>
      <Seo title={productId ? "Update a product" : "Create a product"} />
      <Toaster />
      <Typography variant="h4">
        {productId ? "Update a product" : "Create a product"}
      </Typography>
      <Form
        onSubmit={submit}
        initialValues={product}
        mutators={{
          ...arrayMutators,
        }}
      >
        {({ handleSubmit, invalid }) => (
          <form noValidate onSubmit={handleSubmit}>
            <div className={classes.formFields}>
              <div className={classes.formField}>
                <Field
                  name="title"
                  component={FormTextField}
                  validate={isRequired}
                  label="Product Title"
                />
              </div>
            </div>
            <div className={classes.formFields}>
              <Field name="desc" validate={isRequired}>
                {(props) => (
                  <div>
                    <ReactDraft
                      {...props.input}
                      placeholder="Write something awesome😌"
                    />
                  </div>
                )}
              </Field>
            </div>
            <div className={classes.formFields}>
              <div className={classes.formField}>
                <Field
                  name="category"
                  component={FormSelectField}
                  options={categories}
                  label={"Categories"}
                  validate={isRequired}
                  initializeValue={product?.category}
                />
              </div>
              <div className={classes.formField}>
                <Field
                  name="productType"
                  component={FormSelectField}
                  options={productTypes}
                  label={"Product Type"}
                  validate={isRequired}
                  initializeValue={product?.productType}
                  inputOnChange={handleProductTypeChange}
                />
              </div>
            </div>
            {/* Based on product type, fields will be shown here */}
            {productType === "simple" ? (
              <>{renderFields("simpleProduct", 0)}</>
            ) : (
              <>
                {/* Product variants */}
                {productType === "variable" ? (
                  <FieldArray
                    name="variantsOptions"
                    initialValue={variantsOptions}
                  >
                    {({ fields }) => (
                      <div>
                        {fields.map((name, index) => (
                          <div key={index}>
                            {index === 0 && (
                              <div className={classes.incDecBtn}>
                                <Typography variant="h6">
                                  Choose Options
                                </Typography>
                                {product?.productType === "variable" &&
                                productId ? (
                                  <Tooltip title="Not available to edit" arrow>
                                    <span>
                                      <CgUnavailable
                                        color={theme.palette.error.light}
                                        fontSize={"1.5em"}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </span>
                                  </Tooltip>
                                ) : (
                                  <div>
                                    <GrAddCircle
                                      onClick={() =>
                                        fields.length < FIELDS_MAX_LIMIT &&
                                        fields.push({ name: "", option: "" })
                                      }
                                    />
                                    <AiOutlineMinusCircle
                                      onClick={() => fields.remove(index)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            <div className={classes.formFields}>
                              <div className={classes.formField}>
                                <Field
                                  name={`${name}.name`}
                                  component={FormSelectField}
                                  options={
                                    GetVariantsName(productVariants) || []
                                  }
                                  label={"Variants"}
                                  validate={isRequired}
                                  initializeValue={
                                    selectedVariants[index] || ""
                                  }
                                  inputOnChange={(value) => {
                                    if (
                                      !Object.values(selectedVariants).includes(
                                        value
                                      )
                                    ) {
                                      setSelectedVariants((prevValue) => ({
                                        ...prevValue,
                                        [index]: value,
                                      }));

                                      setSelectedOptions((prevValue) => ({
                                        ...prevValue,
                                        [index]: [],
                                      }));
                                    } else {
                                      setSelectedVariants((prevValue) => ({
                                        ...prevValue,
                                        [index]: null,
                                      }));
                                    }
                                  }}
                                  disabled={
                                    product?.productType === "variable" &&
                                    productId
                                  }
                                />
                              </div>
                              <div className={classes.formField}>
                                <Autocomplete
                                  multiple
                                  options={options[index] || []}
                                  getOptionLabel={(option) => option.value}
                                  isOptionEqualToValue={(option, value) =>
                                    option.value === value.value || value === ""
                                  }
                                  filterSelectedOptions
                                  value={selectedOptions[index] || []}
                                  onChange={(event, values) =>
                                    handleAutocompleteChange(index, values)
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Options"
                                      placeholder="Choose options"
                                    />
                                  )}
                                  disabled={
                                    product?.productType === "variable" &&
                                    productId
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                ) : productType === "3d" ? (
                  <>{renderFields3d("modelThreeD", 0)}</>
                ) : null}

                {/* Based on variants admin has chosen, fields will be shown here */}
                {variants?.length > 0 && (
                  <FieldArray
                    name="variants"
                    value={variants}
                    initialValue={variants}
                  >
                    {({ fields }) => (
                      <div>
                        {fields.map((name, index) => (
                          <div key={index} className={classes.variant}>
                            <label>
                              <b>
                                {"#Variant " +
                                  (index + 1) +
                                  ": " +
                                  `${CapitalizeText(
                                    variants[index]?.variantName
                                  )}`}
                              </b>
                            </label>
                            {renderFields(name, index)}
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                )}
              </>
            )}
            <div className={classes.actionBtn}>
              <PrimaryButton
                type="submit"
                text="Save"
                disabled={invalid}
                spinner={loading}
              />
            </div>
          </form>
        )}
      </Form>
    </Paper>
  );
}

export { getServerSideProps };
