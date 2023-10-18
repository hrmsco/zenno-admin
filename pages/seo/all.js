// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  GET_SEO_TITLE_DESCS,
  DELETE_SEO_TITLE_DESC,
} from "@/Queries/SeoTitleDesc.js";
import {
  getSeoTitleDescs,
  removeSeoTitleDesc,
} from "@/Redux/slices/seoTitleDescs.js";
import CapitalizeText from "@/Helpers/CapitalizeText.js";
import MuiPagination from "@/Components/MuiPagination/MuiPagination";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import Toaster from "@/Components/Toaster/Toaster";
import useStyles from "@/styles/seo.js";
import getServerSideProps from "@/Helpers/ServerProps.js";

// ** MUI Imports
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid } from "@mui/x-data-grid";

// ** Third Party Imports
import { useQuery, useMutation } from "@apollo/client";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";

export default function SeoTitleDescs() {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  // States
  const [seoTitleDescs, setSeoTitleDescs] = useState([]);

  // Queries
  const seoTitleDescsQuery = useQuery(GET_SEO_TITLE_DESCS);

  // Seo title & descs
  const seoTitleDescsData = useSelector(
    (state) => state.seoTitleDescs.seoTitleDescs
  );

  useEffect(() => {
    const seoTitleDescs = seoTitleDescsQuery?.data?.getSeoTitleDescs;

    if (seoTitleDescs && seoTitleDescsData?.length === 0) {
      dispatch(getSeoTitleDescs(seoTitleDescs));
    }

    setSeoTitleDescs(seoTitleDescsData);
  }, [seoTitleDescsQuery, seoTitleDescsData]);

  // Table columns
  const columns = [
    {
      field: "pageName",
      headerName: "Page Name",
      width: 200,
      renderCell: (params) => {
        return (
          <Typography variant="subtitle1">
            {CapitalizeText(params.row.pageName)}
          </Typography>
        );
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 300,
    },
    {
      field: "desc",
      headerName: "Description",
      width: 400,
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        return (
          <div>
            <Link href={"edit/" + params.row._id}>
              <IconButton>
                <Tooltip title="Edit" arrow>
                  <span>
                    <FiEdit2 />
                  </span>
                </Tooltip>
              </IconButton>
            </Link>
            <IconButton>
              <Tooltip title="Delete" arrow>
                <span>
                  <AiOutlineDelete
                    onClick={() => handleDeleteSeoTitleDesc(params.row._id)}
                  />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        );
      },
    },
  ];

  // Delete seoTitleDesc
  const handleDeleteSeoTitleDesc = (seoId) => {
    deleteSeoTitleDesc({ variables: { id: seoId } });
  };

  const [deleteSeoTitleDesc] = useMutation(DELETE_SEO_TITLE_DESC, {
    onCompleted(data) {
      if (data.deleteSeoTitleDesc.status === 200) {
        ToastStatus("Success", data.deleteSeoTitleDesc.message);
        dispatch(removeSeoTitleDesc(data.deleteSeoTitleDesc._id));
      } else {
        ToastStatus("Error", "Error occurred");
      }
    },
  });

  return (
    <div className={classes.tableContainer}>
      <Seo title={"Seo"} />
      <Toaster />
      <div className={classes.tableTop}>
        <Typography variant="h4">Seo Title & Description</Typography>
        <PrimaryButton text="Add Seo" href={"/seo/add"} />
      </div>
      {Array.isArray(seoTitleDescs) && (
        <DataGrid
          className={classes.table}
          rows={seoTitleDescs}
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
                No seo found
              </Stack>
            ),
            NoResultsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No seo found
              </Stack>
            ),
            Pagination: MuiPagination,
          }}
        />
      )}
    </div>
  );
}

export { getServerSideProps };
