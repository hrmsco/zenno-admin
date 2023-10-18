// ** Next, React And Locals Imports
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SITE_SETTINGS } from "@/Queries/SiteSettings.js";
import { editSiteSettings } from "@/Redux/slices/siteSettings.js";
import { composeValidators, isRequired } from "@/Helpers/FormValidators.js";
import { FormSelectField, FormTextArea } from "@/Helpers/FormFields.js";
import MuiSwitch from "@/Components/MuiSwitch/MuiSwitch";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/styles/customer-views.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** Mui imports
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// ** Third party imports
import { useMutation } from "@apollo/client";
import { Field, Form } from "react-final-form";

export default function CustomerViews() {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  // States
  const [checked, setChecked] = useState(false);

  // Customer views timer
  const customerViewsTimer = [
    {
      value: "3 seconds",
    },
    {
      value: "5 seconds",
    },
    {
      value: "7 seconds",
    },
    {
      value: "10 seconds",
    },
  ];

  // Site settings
  const siteSettings = useSelector((state) => state.siteSettings.siteSettings);

  useEffect(() => {
    if (siteSettings?.customerViews) {
      setChecked(siteSettings.customerViews);
    }
  }, [siteSettings]);

  // Updating the customer views
  const handleChange = (e) => {
    setChecked(e.target.checked);

    if (e.target.checked === false) {
      const valuesObject = {
        id: siteSettings._id,
        customerViews: e.target.checked,
      };

      customerViews({ variables: valuesObject });
    }
  };

  const submit = (values) => {
    const valuesObject = {
      id: siteSettings._id,
      customerViews: checked,
      customerViewsNos: values.customerViewsNos,
      customerViewsTimer: values.customerViewsTimer,
    };

    customerViews({ variables: valuesObject });
  };

  const [customerViews, { loading }] = useMutation(SITE_SETTINGS, {
    onCompleted(data) {
      if (data.siteSettings.status === 200) {
        dispatch(editSiteSettings(data.siteSettings));
        ToastStatus("Success", data.siteSettings.message);
      } else {
        ToastStatus("Error", data.siteSettings.message);
      }
    },
  });

  return (
    <Paper className={classes.form}>
      <Seo title={"Customer Views"} />
      <Toaster />
      <Typography variant="h4">Customer Views:</Typography>
      <div className={classes.switchContainer}>
        <Typography variant="h6">Enable / Disable:</Typography>
        <div className={classes.switch}>
          <MuiSwitch checked={checked} onClick={handleChange} />
        </div>
      </div>
      {checked && (
        <Form onSubmit={submit} initialValues={siteSettings}>
          {({ handleSubmit, invalid }) => (
            <form noValidate onSubmit={handleSubmit}>
              <div className={classes.formField}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Enter Numbers:
                </Typography>
                <Field
                  name="customerViewsNos"
                  component={FormTextArea}
                  validate={composeValidators(isRequired)}
                  label={"Enter numbers"}
                  rows={4}
                  required={true}
                  helperText="Eg: 23,57,99,77,22 - Add 15 - 25 numbers"
                />
              </div>
              <div className={classes.formField}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Choose Time
                </Typography>
                <Field
                  name="customerViewsTimer"
                  component={FormSelectField}
                  validate={isRequired}
                  label={"Change Once"}
                  options={customerViewsTimer}
                  initializeValue={siteSettings?.customerViewsTimer}
                  required={true}
                />
              </div>
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
      )}
    </Paper>
  );
}

export { getServerSideProps };
