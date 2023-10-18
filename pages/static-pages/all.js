// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { GET_STATIC_PAGES, DELETE_STATIC_PAGE } from "@/Queries/StaticPages.js";
import {
  getStaticPages,
  removeStaticPage,
} from "@/Redux/slices/staticPages.js";
import CapitalizeText from "@/Helpers/CapitalizeText.js";
import MuiPagination from "@/Components/MuiPagination/MuiPagination";
import Seo from "@/Components/Seo/Seo";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import Toaster from "@/Components/Toaster/Toaster";
import useStyles from "@/styles/static-pages.js";
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

export default function StaticPageManagement() {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  // States
  const [staticPages, setStaticPages] = useState([]);

  //Queries
  const staticPagesQuery = useQuery(GET_STATIC_PAGES);

  // Static pages
  const staticPagesData = useSelector((state) => state.staticPages.staticPages);

  useEffect(() => {
    const staticPages = staticPagesQuery?.data?.getStaticPages;

    if (staticPages && staticPagesData?.length === 0) {
      dispatch(getStaticPages(staticPages));
    }

    setStaticPages(staticPagesData);
  }, [staticPagesQuery, staticPagesData]);

  // Table columns
  const columns = [
    {
      field: "pageName",
      headerName: "Page Name",
      width: 300,
      renderCell: (params) => {
        return (
          <Typography variant="subtitle1">
            {CapitalizeText(params.row.pageName.replaceAll("-", " "))}
          </Typography>
        );
      },
    },
    {
      field: "pageContent",
      headerName: "Page Content",
      width: 400,
      renderCell: (params) => {
        return (
          <Typography
            variant="subtitle1"
            dangerouslySetInnerHTML={{ __html: params.row.pageContent }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        return (
          <div>
            <Link href={"edit/" + params.row._id}>
              <IconButton>
                <Tooltip title="Edit Page" arrow>
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
                    onClick={() => handleDeleteStaticPage(params.row._id)}
                  />
                </span>
              </Tooltip>
            </IconButton>
          </div>
        );
      },
    },
  ];

  // Delete static page
  const handleDeleteStaticPage = (pageId) => {
    deleteStaticPage({ variables: { id: pageId } });
  };

  const [deleteStaticPage] = useMutation(DELETE_STATIC_PAGE, {
    onCompleted(data) {
      if (data.deleteStaticPage.status === 200) {
        ToastStatus("Success", data.deleteStaticPage.message);
        dispatch(removeStaticPage(data.deleteStaticPage._id));
      } else {
        ToastStatus("Error", "Error occurred");
      }
    },
  });

  return (
    <div className={classes.tableContainer}>
      <Seo title={"Static Pages"} />
      <Toaster />
      <div className={classes.tableTop}>
        <Typography variant="h4">Static Pages</Typography>
        <PrimaryButton text="Add Static Page" href={"/static-pages/add"} />
      </div>
      {Array.isArray(staticPages) && (
        <DataGrid
          className={classes.table}
          rows={staticPages}
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
                No static pages found
              </Stack>
            ),
            NoResultsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No static pages found
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
