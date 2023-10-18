// ** Next, React And Locals Imports
import { useRouter } from "next/router";
import { ADMIN_LOGIN } from "@/Queries/Admins.js";
import { FormTextField } from "@/Helpers/FormFields.js";
import {
  composeValidators,
  isValidEmail,
  isRequired,
} from "@/Helpers/FormValidators.js";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/styles/login.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// ** Third Party Imports
import { Form, Field } from "react-final-form";
import { useMutation } from "@apollo/client";

export default function LoginPage() {
  const { classes } = useStyles();
  const router = useRouter();

  const submit = (values) => {
    const valuesObject = {
      email: values.email.toLowerCase(),
      password: values.password,
    };

    adminLogin({ variables: valuesObject });
  };

  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN, {
    onCompleted(data) {
      if (data.adminLogin.status === 200 || data.adminLogin.status === 201) {
        if (data.adminLogin.role.name !== "superAdmin") {
          const isDashboardExist =
            data.adminLogin.role.privileges.includes("/");

          if (!isDashboardExist) {
            router.push(data.adminLogin.role.privileges[0]);
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } else {
        ToastStatus("Error", data.adminLogin.message);
      }
    },
  });

  return (
    <div className={classes.container}>
      <Seo title={"Login"} />
      <Toaster />
      <Paper className={classes.loginForm}>
        <Typography variant="h3">Login</Typography>
        <Form onSubmit={submit}>
          {({ handleSubmit, invalid }) => (
            <form noValidate onSubmit={handleSubmit}>
              <div className={classes.formField}>
                <Field
                  name="email"
                  component={FormTextField}
                  validate={composeValidators(isValidEmail, isRequired)}
                  label="Email"
                />
              </div>
              <div className={classes.formField}>
                <Field
                  name="password"
                  type="password"
                  component={FormTextField}
                  validate={isRequired}
                  label="Password"
                />
              </div>
              <div className={classes.actionBtn}>
                <PrimaryButton
                  type="submit"
                  text="Login"
                  disabled={invalid}
                  spinner={loading}
                  fullWidth
                />
              </div>
            </form>
          )}
        </Form>
      </Paper>
    </div>
  );
}
