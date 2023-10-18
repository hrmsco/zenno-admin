// ** Next, React And Locals Imports
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  GET_SEO_TITLE_DESCS,
  SEO_TITLE_DESCS,
} from "@/Queries/SeoTitleDesc.js";
import {
  getSeoTitleDescs,
  addSeoTitleDesc,
  editSeoTitleDesc,
} from "@/Redux/slices/seoTitleDescs.js";
import {
  FormTextField,
  FormTextArea,
  FormSelectField,
} from "@/Helpers/FormFields.js";
import { isRequired } from "@/Helpers/FormValidators.js";
import CapitalizeText from "@/Helpers/CapitalizeText.js";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import Toaster from "@/Components/Toaster/Toaster";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import useStyles from "@/styles/seo.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// ** Third Party Imports
import { Form, Field } from "react-final-form";
import { useQuery, useMutation } from "@apollo/client";

export default function EditSeoTitleDesc() {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();

  // Seo id
  const seoId = router.asPath.split("/")[3];

  // States
  const [currentPage, setCurrentPage] = useState({
    pageName: "",
    title: "",
    desc: "",
  });

  // Queries
  const seoTitleDescsQuery = useQuery(GET_SEO_TITLE_DESCS);

  // Seo title & descs
  const seoTitleDescsData = useSelector(
    (state) => state.seoTitleDescs.seoTitleDescs
  );

  // Setting the initial value
  useEffect(() => {
    const seoTitleDescs = seoTitleDescsQuery?.data?.getSeoTitleDescs;

    if (seoTitleDescs && seoTitleDescsData?.length === 0) {
      dispatch(getSeoTitleDescs(seoTitleDescs));
    }

    if (seoTitleDescsData.length > 0 && seoId) {
      const page = seoTitleDescsData.find((item) => {
        return item._id === seoId;
      });

      if (page) {
        setCurrentPage(page);
      } else {
        router.push("/404");
      }
    }
  }, [seoTitleDescsQuery, seoTitleDescsData]);

  // To add or update the seo title & desc
  const submit = (values) => {
    const valuesObject = {
      id: values._id,
      pageName: values.pageName.toLowerCase(),
      title: values.title,
      desc: values.desc,
    };

    seoTitleDesc({
      variables: valuesObject,
    });
  };

  // Updating the seo title & descs
  const [seoTitleDesc, { loading }] = useMutation(SEO_TITLE_DESCS, {
    onCompleted(data) {
      if (data.seoTitleDescs.status === 200) {
        seoId
          ? dispatch(editSeoTitleDesc(data.seoTitleDescs))
          : dispatch(addSeoTitleDesc(data.seoTitleDescs));

        ToastStatus("Success", data.seoTitleDescs.message);

        //  Modal will close after the timeout
        setTimeout(() => {
          router.push("/seo/all");
        }, 2000);
      } else {
        ToastStatus("Error", data.seoTitleDescs.message);
      }
    },
  });

  // Available pages
  const pages = [
    {
      value: "home",
    },
    {
      value: "shop",
    },
    {
      value: "login",
    },
    {
      value: "register",
    },
    {
      value: "category",
    },
    {
      value: "help",
    },
  ];

  return (
    <Paper className={classes.form}>
      <Seo title={seoId ? "Edit Seo Title & Desc" : "Add Seo Title & Desc"} />
      <Toaster />
      <Typography variant="h4" className={classes.pageTitle}>
        {seoId ? "Edit Seo Title & Desc" : "Add Seo Title & Desc"}:{" "}
        {CapitalizeText(currentPage?.pageName)}
      </Typography>
      <Form onSubmit={submit} initialValues={currentPage}>
        {({ handleSubmit, invalid }) => (
          <form onSubmit={handleSubmit}>
            <div className={classes.formField}>
              <Field
                name="pageName"
                options={pages}
                component={FormSelectField}
                validate={isRequired}
                label={"Page Name"}
                initializeValue={currentPage.pageName}
                disabled={currentPage?.pageName?.length > 0}
              />
            </div>
            <div className={classes.formField}>
              <Field
                name="title"
                component={FormTextField}
                validate={isRequired}
                label={"Page Title"}
                helperText={"Keep your title length around 60 characters"}
              />
            </div>
            <div className={classes.formField}>
              <Field
                name="desc"
                component={FormTextArea}
                validate={isRequired}
                label={"Page Description"}
                helperText={
                  "Keep your description length around 160 characters"
                }
              />
            </div>
            <div className={classes.actionBtn}>
              <PrimaryButton
                type="submit"
                text={seoId ? "Update" : "Add"}
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
