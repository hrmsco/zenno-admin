// ** Next, React And Locals Imports
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  GET_PRODUCT_SETTINGS,
  PRODUCT_VARIANTS,
} from "@/Queries/ProductSettings.js";
import {
  getProductSettings,
  editProductSettings,
} from "@/Redux/slices/productSettings.js";
import { FormTextField } from "@/Helpers/FormFields.js";
import { isRequired } from "@/Helpers/FormValidators.js";
import CapitalizeText from "@/Helpers/CapitalizeText";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/styles/product-variants.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// ** Third Party Imports
import { Form, Field } from "react-final-form";
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import { useQuery, useMutation } from "@apollo/client";
import { GrAddCircle } from "react-icons/gr";
import { AiOutlineMinusCircle } from "react-icons/ai";

export default function AddOrEditVariant() {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();

  // Id
  const variantId = router.asPath.split("/")[2]?.split("_")[1];

  // States
  const [variant, setVariant] = useState(null);
  const FIELDS_MAX_LIMIT = 20; // Variant options limit

  // Queries
  const productSettingsQuery = useQuery(GET_PRODUCT_SETTINGS);

  // Product settings (variants)
  const productSettings = useSelector(
    (state) => state.productSettings.productSettings
  );

  const variantsData = productSettings?.variants;

  // Setting the initial value
  useEffect(() => {
    const productSettingsData = productSettingsQuery?.data?.getProductSettings;

    if (productSettingsData) {
      dispatch(getProductSettings(productSettingsData));
    }

    if (variantsData?.length > 0 && variantId) {
      const variant = variantsData.find((item) => {
        return item._id === variantId;
      });

      // Remove __typename property
      const updatedVariant = {
        ...variant,
        options: variant.options.map(({ __typename, ...rest }) => rest),
      };

      setVariant(updatedVariant);
    } else {
      variant === null && setVariant({ options: [{ value: "", meta: "" }] });
    }
  }, [productSettingsQuery, variantsData]);

  const submit = (values) => {
    const valuesObject = {
      id: productSettings?._id,
      variant: {
        id: values._id,
        name: values.name.toLowerCase(),
        options: values.options.map(({ _id, ...rest }) => rest),
      },
    };

    productVariants({
      variables: valuesObject,
    });
  };

  // Updating the product variant
  const [productVariants, { loading }] = useMutation(PRODUCT_VARIANTS, {
    onCompleted(data) {
      if (data.productVariants.status === 200) {
        variantId
          ? dispatch(editProductSettings(data.productVariants))
          : dispatch(getProductSettings(data.productVariants));

        ToastStatus("Success", data.productVariants.message);

        //  Modal will close after the timeout
        setTimeout(() => {
          router.push("/products/variants");
        }, 2000);
      } else {
        ToastStatus("Error", data.productVariants.message);
      }
    },
  });

  return (
    <Paper className={classes.form}>
      <Seo title={variantId ? "Edit Variant" : "Add Variant"} />
      <Toaster />
      <Typography variant="h4" sx={{ mb: 5 }}>
        {variantId ? "Edit Variant" : "Add Variant"}:{" "}
        {variant?.name && CapitalizeText(variant.name)}
      </Typography>
      <Form
        onSubmit={submit}
        initialValues={variant}
        mutators={{
          ...arrayMutators,
        }}
      >
        {({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <div className={classes.formField}>
              <Field
                name="name"
                component={FormTextField}
                label={"Variant Name"}
                validate={isRequired}
              />
            </div>
            {/* FAQs */}
            <FieldArray name="options">
              {({ fields }) => (
                <div>
                  {fields.map((name, index) => (
                    <div key={index}>
                      <div className={classes.options}>
                        <label>{"#Option " + (index + 1)}</label>
                        <div>
                          <GrAddCircle
                            onClick={() =>
                              fields.length < FIELDS_MAX_LIMIT &&
                              fields.push({ value: "", meta: "" })
                            }
                          />
                          <AiOutlineMinusCircle
                            onClick={() => fields.remove(index)}
                          />
                        </div>
                      </div>
                      <div className={classes.formFields}>
                        <div className={classes.formField}>
                          <Field
                            name={`${name}.value`}
                            component={FormTextField}
                            label={"Value"}
                          />
                        </div>
                        <div className={classes.formField}>
                          <Field
                            name={`${name}.meta`}
                            component={FormTextField}
                            label={"Meta"}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FieldArray>
            <div className={classes.actionBtn}>
              <PrimaryButton
                type="submit"
                text={variantId ? "Update" : "Save"}
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
