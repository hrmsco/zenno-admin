// ** Graphql
import { gql } from "@apollo/client";

export const GET_SEO_TITLE_DESCS = gql`
  query {
    getSeoTitleDescs {
      _id
      pageName
      title
      desc
    }
  }
`;

export const SEO_TITLE_DESCS = gql`
  mutation ($id: String, $pageName: String!, $title: String!, $desc: String!) {
    seoTitleDescs(id: $id, pageName: $pageName, title: $title, desc: $desc) {
      _id
      pageName
      title
      desc
      status
      message
    }
  }
`;

export const DELETE_SEO_TITLE_DESC = gql`
  mutation ($id: String!) {
    deleteSeoTitleDesc(id: $id) {
      _id
      status
      message
    }
  }
`;
