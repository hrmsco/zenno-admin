// ** Graphql
import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query (
    $page: Int!
    $limit: Int!
    $category: [String]
    $priceRange: [String]
    $trending: Boolean
    $inStock: Boolean
    $sortBy: String
  ) {
    getProducts(
      page: $page
      limit: $limit
      category: $category
      priceRange: $priceRange
      trending: $trending
      inStock: $inStock
      sortBy: $sortBy
    ) {
      totalCount
      products {
        _id
        title
        desc
        category
        productType
        thumbnails
        images
        thumbnails
        attributes1 {
          title
          description
        }
        attributes2 {
          title
          description
        }
        regularPrice
        salePrice
        tax
        totalStocks
        inStock
        variantsOptions {
          name
          options {
            variantId
            value
            meta
          }
        }
        variants {
          variantName
          variantsId
          images
          regularPrice
          salePrice
          tax
          totalStocks
          inStock
        }
        trending
      }
    }
  }
`;

export const GET_PRODUCTS_BY_IDS = gql`
  mutation ($ids: [String]!) {
    getProductsByIds(ids: $ids) {
      _id
      title
      desc
      category
      productType
      images
      thumbnails
      attributes1 {
        title
        description
      }
      attributes2 {
        title
        description
      }
      regularPrice
      salePrice
      tax
      totalStocks
      inStock
      variantsOptions {
        name
        options {
          variantId
          value
          meta
        }
      }
      variants {
        variantName
        variantsId
        images
        regularPrice
        salePrice
        tax
        totalStocks
        inStock
      }
      trending
    }
  }
`;

export const SET_TRENDING_PRODUCTS = gql`
  mutation ($id: String!, $trending: Boolean!) {
    setTrendingProduct(id: $id, trending: $trending) {
      _id
      trending
      status
      message
    }
  }
`;

export const PRODUCTS = gql`
  mutation (
    $id: String
    $title: String!
    $desc: String
    $category: String!
    $images: [String]
    $thumbnails: [String]
    $attributes1: [attribute1InputType]
    $attributes2: [attribute1InputType]
    $regularPrice: Float
    $salePrice: Float
    $tax: Float
    $totalStocks: Int
    $inStock: Boolean
    $productType: String!
    $variantsOptions: [variantInputType]
    $variants: [productVariantInputType]
  ) {
    products(
      id: $id
      title: $title
      desc: $desc
      category: $category
      images: $images
      thumbnails: $thumbnails
      attributes1: $attributes1
      attributes2: $attributes2
      regularPrice: $regularPrice
      salePrice: $salePrice
      tax: $tax
      totalStocks: $totalStocks
      inStock: $inStock
      productType: $productType
      variantsOptions: $variantsOptions
      variants: $variants
    ) {
      _id
      title
      desc
      category
      productType
      images
      thumbnails
      attributes1 {
        title
        description
      }
      attributes2 {
        title
        description
      }
      regularPrice
      salePrice
      tax
      totalStocks
      inStock
      variantsOptions {
        name
        options {
          variantId
          value
          meta
        }
      }
      variants {
        variantName
        variantsId
        images
        regularPrice
        salePrice
        tax
        totalStocks
        inStock
      }
      trending
      status
      message
    }
  }
`;

export const GET_NEW_PRODUCTS = gql`
  query {
    getNewProducts {
      title
    }
  }
`;

export const OUT_OF_STOCK_PRODUCTS = gql`
  query {
    getOutOfStockProducts {
      inStock
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation ($id: String) {
    deleteProduct(id: $id) {
      _id
      status
      message
    }
  }
`;
