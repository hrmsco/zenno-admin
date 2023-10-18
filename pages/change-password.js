// ** Next, React And Locals Imports
import { useRouter } from "next/router";
import { CHANGE_ADMIN_PASSWORD } from "@/Queries/ChangePassword.js";
import { FormTextField, FormPasswordField } from "@/Helpers/FormFields.js";
import {
  composeValidators,
  isValidEmail,
  isValidPassword,
  isRequired,
} from "@/Helpers/FormValidators.js";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/styles/change-password.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// ** Third Party Imports
import { Form, Field } from "react-final-form";
import { useMutation } from "@apollo/client";

export default function ChangePassword() {
  const { classes } = useStyles();
  const router = useRouter();

  // To update the password
  const submit = (values) => {
    const valuesObject = {
      email: values.email,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    };

    changeAdminPassword({ variables: valuesObject });
  };

  // Changing the password
  const [changeAdminPassword, { loading }] = useMutation(
    CHANGE_ADMIN_PASSWORD,
    {
      onCompleted(data) {
        if (data.changeAdminPassword.status === 200) {
          ToastStatus("Success", data.changeAdminPassword.message);

          setTimeout(() => {
            router.push("/login");
          }, [2500]);
        } else {
          ToastStatus("Error", data.changeAdminPassword.message);
        }
      },
    }
  );

  return (
    <Paper className={classes.form}>
      <Seo title={"Change Password"} />
      <Toaster />
      <Typography variant="h4">Change Password</Typography>
      <Form onSubmit={submit}>
        {({ handleSubmit, invalid }) => (
          <form noValidate onSubmit={handleSubmit}>
            <div className={classes.formField}>
              <Field
                name="email"
                component={FormTextField}
                validate={composeValidators(isRequired, isValidEmail)}
                label="Email"
              />
            </div>
            <div className={classes.formField}>
              <Field
                name="newPassword"
                component={FormPasswordField}
                validate={composeValidators(isRequired, isValidPassword)}
                label={"New Password"}
                helperText="Minimum 8 characters required!"
              />
            </div>
            <div className={classes.formField}>
              <Field
                name="confirmNewPassword"
                type="password"
                component={FormTextField}
                validate={composeValidators(isRequired, isValidPassword)}
                label="Confirm New Password"
              />
            </div>
            <div className={classes.actionBtn}>
              <PrimaryButton
                type="submit"
                text="Confirm"
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
