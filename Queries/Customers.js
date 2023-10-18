// ** Graphql
import { gql } from "@apollo/client";

export const GET_CUSTOMERS = gql`
  query {
    getCustomers {
      _id
      firstName
      lastName
      avatar
      email
      phoneNumber
      gender
      dob
      address {
        address1
        address2
        city
        state
        country
        postal_code
      }
      customerStatus
      status
      message
    }
  }
`;

export const GET_CUSTOMER_BY_ID = gql`
  mutation ($id: String!) {
    getCustomerById(id: $id) {
      _id
      firstName
      lastName
      avatar
      email
      phoneNumber
      gender
      dob
      address {
        address1
        address2
        city
        state
        country
        postal_code
      }
      customerStatus
      status
      message
    }
  }
`;

export const CUSTOMERS = gql`
  mutation (
    $id: String!
    $firstName: String
    $lastName: String
    $avatar: String
    $email: String!
    $phoneNumber: String
    $gender: String
    $dob: String
    $address: addressInputType
    $customerStatus: String
    $stripeCusId: String
  ) {
    customers(
      id: $id
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
      email: $email
      phoneNumber: $phoneNumber
      gender: $gender
      dob: $dob
      address: $address
      customerStatus: $customerStatus
      stripeCusId: $stripeCusId
    ) {
      _id
      firstName
      lastName
      avatar
      email
      phoneNumber
      gender
      dob
      address {
        address1
        address2
        city
        state
        country
        postal_code
      }
      customerStatus
      status
      message
    }
  }
`;

export const GET_NEW_CUSTOMERS = gql`
  query {
    getNewCustomers {
      email
    }
  }
`;

export const GET_SUSPENDED_CUSTOMERS = gql`
  query {
    getSuspendedCustomers {
      email
    }
  }
`;
