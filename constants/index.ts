const salesURL = process.env.SALES_URL || "";
const authorization = process.env.URL_AUTHORIZATION || "";
const cookie = process.env.URL_COOKIE || "";

const saleCloudURL = process.env.SALE_CLOUD_URL || "";
const saleCloudAuthToken = process.env.SALE_CLOUD_AUTH_TOKEN || "";

const purchaseCloudURL = process.env.PURCHASE_CLOUD_URL || "";
const purchaseCloudAuthToken = process.env.PURCHASE_CLOUD_AUTH_TOKEN || "";


export {
  salesURL,
  authorization,
  cookie,
  saleCloudURL,
  saleCloudAuthToken,
  purchaseCloudURL,
  purchaseCloudAuthToken,
};