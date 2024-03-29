import {
  ActionList,
  Banner,
  Button,
  Card,
  Checkbox,
  Form,
  FormLayout,
  Heading,
  Layout,
  Modal,
  Popover,
  Select,
  Stack,
  TextContainer,
  TextField,
} from "@shopify/polaris";
import {
  Alert,
  Col,
  Divider,
  Input,
  PageHeader,
  Row,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { getOrder, massAction } from "../../../../../APIrequests/OrdersAPI";
import { parseQueryString } from "../../../../../services/helperFunction";
import {
  cancelOrdersURl,
  deleteOrdersURL,
  getOrderURL,
  removeOrdersURL,
  syncShipmentURL,
  updateOrderURL,
} from "../../../../../URLs/OrdersURL";
import NestedTableComponent from "../../../../AntDesignComponents/NestedTableComponent";
import TabsComponent from "../../../../AntDesignComponents/TabsComponent";

const { Paragraph } = Typography;

const ViewOrdersPolaris = (props) => {
  const [shopifyOrderName, setShopifyOrderName] = useState(null);
  const [financialStatus, setFinancialStatus] = useState(null);
  const [shopifyOrderID, setShopifyOrderID] = useState(null);
  const [ebayOrderID, setEbayOrderID] = useState(null);
  const [eBayRefrenceID, setEbayRefrenceID] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [ebayOrderData, setEbayOrderData] = useState(null);

  //   buyer details
  const [buyerName, setBuyerName] = useState(null);
  const [buyerEmail, setBuyerEmail] = useState(null);
  const [buyerAddress, setBuyerAddress] = useState({
    address: "",
    phone: "",
    city: "",
    country: "",
    zip: "",
    countryCode: "",
    province: "",
  });

  //   payment details
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "",
    price: "",
    taxesApplied: "",
    inclusiveTax: "",
  });

  //   shipping details
  const [shippingDetails, setShippingDetails] = useState({
    service: "",
    cost: "",
  });

  //   fulfillments details
  let [fulfillmentsDetails, setFulfillmentsDetails] = useState({
    trackingCompany: "",
    trackingNumber: "",
    createdAt: "",
    updatedAt: "",
  });

  //   action
  const [actionPopoverActive, setActionPopoverActive] = useState(false);
  const [actionModal, setActionModal] = useState({
    title: "",
    active: false,
    value: "",
  });
  const [updateOrder, setUpdateOrder] = useState({
    email: "",
    phone: "",
    shipping_address: {
      first_name: "",
      last_name: "",
      address1: "",
      phone: "",
      company: "",
      city: "",
      province: "",
      zip: "",
      country: "",
    },
    customer: "no",
    tags: "",
    note: "",
  });

  const getModalStructure = (title, active, value) => {
    setActionModal({ ...actionModal, title, active, value });
  };
  const actionOptions = [
    {
      content: "Remove from app",
      onAction: () =>
        getModalStructure("Remove from app", true, "removeFromApp"),
    },
    {
      content: "Update Order",
      onAction: () => getModalStructure("Update Order", true, "updateOrder"),
    },
    {
      content: "Sync Shipment",
      onAction: () => getModalStructure("Sync Shipment", true, "syncShipment"),
    },
    {
      content: "Cancel Order",
      onAction: () => getModalStructure("Cancel Order", true, "cancelOrder"),
    },
    {
      content: "Delete Order",
      onAction: () => getModalStructure("Delete Order", true, "deleteOrder"),
    },
  ];

  const hitOrderAPI = async () => {
    let { id } = parseQueryString(props.location.search);
    let postData = { order_id: id };
    let { success, data } = await getOrder(getOrderURL, postData);
    if (success) {
      setShopifyOrderName(data["shopify_order_name"]);
      setFinancialStatus(data["financial_status"]);
      setShopifyOrderID(data["target_order_id"]);
      setEbayOrderID(data["source_order_id"]);
      setLineItems(data["line_items"]);
      setEbayRefrenceID(data["source_order_data"]["ExtendedOrderID"]);
      setEbayOrderData(data["source_order_data"]);

      setBuyerEmail(data["client_details"]["email"]);
      setBuyerName(data["client_details"]["name"]);
      let tempAddress = buyerAddress;
      tempAddress["address"] = data["shipping_address"]["address1"];
      tempAddress["phone"] = data["shipping_address"]["phone_number"];
      tempAddress["city"] = data["shipping_address"]["city"];
      tempAddress["country"] = data["shipping_address"]["country"];
      tempAddress["zip"] = data["shipping_address"]["zip"];
      tempAddress["countryCode"] = data["shipping_address"]["country_code"];
      tempAddress["province"] = data["shipping_address"]["province"];
      setBuyerAddress(tempAddress);

      let { tax_lines } = data;
      let taxesArray = Object.keys(tax_lines).map(
        (taxObj) => tax_lines[taxObj].title
      );
      let tempPaymentDetails = paymentDetails;
      tempPaymentDetails["paymentMethod"] = data["payment_method"];
      tempPaymentDetails["price"] = data["total_price"];
      tempPaymentDetails["inclusiveTax"] = data["total_tax"];
      tempPaymentDetails["taxesApplied"] = taxesArray.length
        ? taxesArray.join(",")
        : "";
      setPaymentDetails(tempPaymentDetails);

      let { shipping_cost_details } = data;
      shippingDetails["service"] = shipping_cost_details
        ? shipping_cost_details.title
        : "";
      shippingDetails["cost"] = shipping_cost_details
        ? shipping_cost_details.cost
        : "";
      setShippingDetails(shippingDetails);

      let { fulfillments } = data;
      if (fulfillments) {
        fulfillmentsDetails["trackingCompany"] =
          fulfillments["0"].tracking_company;
        fulfillmentsDetails["trackingNumber"] =
          fulfillments["0"].tracking_number;
        fulfillmentsDetails["createdAt"] = fulfillments["0"].created_at;
        fulfillmentsDetails["updatedAt"] = fulfillments["0"].updated_at;
      } else {
        fulfillmentsDetails = false;
      }
      setFulfillmentsDetails(fulfillmentsDetails);
    }
  };

  useEffect(() => {
    hitOrderAPI();
  }, []);

  const updateOrderOnChange = (value, type, innerType) => {
    let temp = { ...updateOrder };
    switch (type) {
      case "email":
        temp["email"] = value;
        break;
      case "phone":
        temp["phone"] = value;
        break;
      case "tags":
        temp["tags"] = value;
        break;
      case "note":
        temp["note"] = value;
        break;
      case "shipping_address":
        switch (innerType) {
          case "first_name":
            temp["shipping_address"]["first_name"] = value;
            break;
          case "last_name":
            temp["shipping_address"]["last_name"] = value;
            break;
          case "address1":
            temp["shipping_address"]["address1"] = value;
            break;
          case "phone":
            temp["shipping_address"]["phone"] = value;
            break;
          case "company":
            temp["shipping_address"]["company"] = value;
            break;
          case "city":
            temp["shipping_address"]["city"] = value;
            break;
          case "province":
            temp["shipping_address"]["province"] = value;
            break;
          case "zip":
            temp["shipping_address"]["zip"] = value;
            break;
          case "country":
            temp["shipping_address"]["country"] = value;
            break;
          default:
            break;
        }
      default:
        break;
    }
    setUpdateOrder(temp);
  };
  const updateOrderActionStructure = () => {
    return (
      <Form onSubmit={() => {}}>
        <FormLayout>
          <TextField
            value={updateOrder.email}
            onChange={(e) => updateOrderOnChange(e, "email")}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            helpText={
              <span>
                We’ll use this email address to inform you on future changes to
                Polaris.
              </span>
            }
          />
          <TextField
            value={updateOrder.phone}
            onChange={(e) => updateOrderOnChange(e, "phone")}
            label="Phone"
            inputMode="tel"
            type="tel"
            helpText={
              <span>
                We’ll use this email address to inform you on future changes to
                Polaris.
              </span>
            }
          />
          <>Shipping Address</>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label={"First Name"}
                value={updateOrder.shipping_address.first_name}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "first_name")
                }
              />
              <TextField
                label={"Last Name"}
                value={updateOrder.shipping_address.last_name}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "last_name")
                }
              />
              <TextField
                label={"Country"}
                value={updateOrder.shipping_address.country}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "country")
                }
              />
              <TextField
                label={"Phone"}
                value={updateOrder.shipping_address.phone}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "phone")
                }
              />
              <TextField
                label={"Company"}
                value={updateOrder.shipping_address.company}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "company")
                }
              />
              <TextField
                label={"City"}
                value={updateOrder.shipping_address.city}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "city")
                }
              />
              <TextField
                label={"Province"}
                value={updateOrder.shipping_address.province}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "province")
                }
              />
              <TextField
                label={"ZIP"}
                value={updateOrder.shipping_address.zip}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "zip")
                }
              />
              <TextField
                label={"Address"}
                value={updateOrder.shipping_address.address1}
                onChange={(e) =>
                  updateOrderOnChange(e, "shipping_address", "address1")
                }
              />
            </FormLayout.Group>
          </FormLayout>
          <Checkbox
            label="Customer"
            checked={updateOrder.customer}
            onChange={() => {}}
          />
          <TextField
            value={updateOrder.tags}
            onChange={(e) => updateOrderOnChange(e, "tags")}
            label="Tags"
            helpText={
              <span>
                We’ll use this email address to inform you on future changes to
                Polaris.
              </span>
            }
          />
          <TextField
            value={updateOrder.note}
            onChange={(e) => updateOrderOnChange(e, "note")}
            label="Note"
            helpText={
              <span>
                We’ll use this email address to inform you on future changes to
                Polaris.
              </span>
            }
          />
        </FormLayout>
      </Form>
    );
  };
  return (
    <PageHeader
      onBack={() => props.history.push("/panel/ebay/orders")}
      title={`Order ${shopifyOrderName}`}
      tags={<Tag color="blue">{financialStatus}</Tag>}
      style={{ minHeight: "90vh" }}
      extra={[
        <Popover
          active={actionPopoverActive}
          activator={
            <Button
              onClick={() => setActionPopoverActive(!actionPopoverActive)}
              disclosure
            >
              Actions
            </Button>
          }
          //   autofocusTarget="first-node"
          onClose={() => setActionPopoverActive(!actionPopoverActive)}
        >
          <ActionList actionRole="menuitem" items={actionOptions} />
        </Popover>,
      ]}
    >
      <TabsComponent
        totalTabs={5}
        tabContents={{
          "Order Details": (
            <OrderDetailsComponent
              shopifyOrderID={shopifyOrderID}
              ebayOrderID={ebayOrderID}
              eBayRefrenceID={eBayRefrenceID}
              lineItems={lineItems}
            />
          ),
          "Buyer Details": (
            <BuyerDetailsComponent
              buyerAddress={buyerAddress}
              buyerName={buyerName}
              buyerEmail={buyerEmail}
            />
          ),
          "Payment Details": <PaymentDetails paymentDetails={paymentDetails} />,
          Shipping: <ShippingDetails shippingDetails={shippingDetails} />,
          Fulfillments: (
            <FulfillmentsDetails fulfillmentsDetails={fulfillmentsDetails} />
          ),
          "Billing Address": <></>,
          "eBay Order Data": (
            <ReactJson
              style={{ maxHeight: 400, overflowY: "scroll" }}
              src={ebayOrderData}
            />
          ),
        }}
      />
      <Modal
        open={actionModal["active"]}
        onClose={() => setActionModal(false)}
        title={actionModal["title"]}
        primaryAction={{
          content: "OK",
          onAction: () => {
            switch (actionModal["value"]) {
              case "updateOrder":
                (async () => {
                  let {} = await massAction(updateOrderURL, {
                    order_ids: shopifyOrderID,
                    updateOrder,
                  });
                })();
                break;
              case "removeFromApp":
                (async () => {
                  let {} = await massAction(removeOrdersURL, {
                    order_ids: ebayOrderID,
                  });
                })();
                break;
              case "syncShipment":
                (async () => {
                  let {} = await massAction(syncShipmentURL, {
                    order_ids: shopifyOrderID,
                  });
                })();
                break;
              case "cancelOrder":
                (async () => {
                  let {} = await massAction(cancelOrdersURl, {
                    order_ids: ebayOrderID,
                  });
                })();
                break;
              case "deleteOrder":
                (async () => {
                  let {} = await massAction(deleteOrdersURL, {
                    order_ids: shopifyOrderID,
                  });
                })();
                break;
              default:
                break;
            }
            setActionModal(false);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setActionModal(false),
          },
        ]}
      >
        <Modal.Section>
          {actionModal.value === "updateOrder" ? (
            updateOrderActionStructure()
          ) : (
            <TextContainer>
              <p>Do you want to perfrom this action?</p>
            </TextContainer>
          )}
        </Modal.Section>
      </Modal>
    </PageHeader>
  );
};

export default ViewOrdersPolaris;

export const OrderDetailsComponent = ({
  shopifyOrderID,
  ebayOrderID,
  lineItems,
  eBayRefrenceID,
}) => {
  // line items
  let [orderColumns, setOrderColumns] = useState([
    {
      title: "Product",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Net quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "SKU Number",
      dataIndex: "sku",
      key: "SKUNumber",
    },
  ]);
  const [orderData, setOrderData] = useState([]);

  const extractLineItems = () => {
    let tempProductData = [];
    tempProductData = lineItems.map((row, index) => {
      let { title, quantity, sku, price } = row;
      let tempObject = {};
      tempObject["key"] = index;
      tempObject["title"] = <Paragraph>{title}</Paragraph>;
      tempObject["quantity"] = <Paragraph>{quantity}</Paragraph>;
      tempObject["sku"] = <Paragraph>{sku}</Paragraph>;
      tempObject["price"] = <Paragraph>{price}</Paragraph>;
      return tempObject;
    });
    setOrderData(tempProductData);
  };

  useEffect(() => {
    extractLineItems();
  }, [lineItems]);

  return (
    <>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Shopify Order Id</Heading>
              <p>{shopifyOrderID}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>eBay Order Id</Heading>
              <p>{ebayOrderID}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Order Date</Heading>
              <p>{shopifyOrderID}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Total Items</Heading>
              <p>{ebayOrderID}</p>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>eBay refrence ID</Heading>
              <p>{eBayRefrenceID}</p>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title={"Line items"} sectioned>
            <NestedTableComponent
              size={"small"}
              pagination={false}
              columns={orderColumns}
              dataSource={orderData}
              bordered={true}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </>
  );
};

export const BuyerDetailsComponent = ({
  buyerAddress,
  buyerEmail,
  buyerName,
}) => {
  return (
    <>
      <Layout>
        <Layout.Section secondary>
          <Card sectioned>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Name</Heading>
              <p>{buyerName}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Email</Heading>
              <p>{buyerEmail}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Phone</Heading>
              <p>{buyerAddress["phone"]}</p>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Address</Heading>
              <p>{buyerAddress["address"]}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>City</Heading>
              <p>{buyerAddress["city"]}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Country</Heading>
              <p>{buyerAddress["country"]}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>ZIP</Heading>
              <p>{buyerAddress["zip"]}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Country Code</Heading>
              <p>{buyerAddress["countryCode"]}</p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Province</Heading>
              <p>{buyerAddress["province"]}</p>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </>
  );
};

export const PaymentDetails = ({ paymentDetails }) => {
  return (
    <>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Payment Method</Heading>
              <p>
                {paymentDetails &&
                  paymentDetails["paymentMethod"] &&
                  paymentDetails["paymentMethod"]}
              </p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Price</Heading>
              <p>
                {paymentDetails &&
                  paymentDetails["price"] &&
                  paymentDetails["price"]}
              </p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Taxes Applied</Heading>
              <p>
                {paymentDetails &&
                  paymentDetails["taxesApplied"] &&
                  paymentDetails["taxesApplied"]}
              </p>
            </Stack>
            <Stack vertical={false} distribution="equalSpacing">
              <Heading>Inclusive Tax</Heading>
              <p>
                {paymentDetails &&
                  paymentDetails["inclusiveTax"] &&
                  paymentDetails["inclusiveTax"]}
              </p>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </>
  );
};

export const ShippingDetails = ({ shippingDetails }) => {
  return (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <Stack vertical={false} distribution="equalSpacing">
            <Heading>Service</Heading>
            <p>{shippingDetails["service"]}</p>
          </Stack>
          <Stack vertical={false} distribution="equalSpacing">
            <Heading>Cost</Heading>
            <p>{shippingDetails["cost"]}</p>
          </Stack>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

export const FulfillmentsDetails = ({ fulfillmentsDetails }) => {
  return fulfillmentsDetails ? (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <Stack vertical={false} distribution="equalSpacing">
            <Heading>Tracking Company</Heading>
            <p>{fulfillmentsDetails["trackingCompany"]}</p>
          </Stack>
          <Stack vertical={false} distribution="equalSpacing">
            <Heading>Tracking Number</Heading>
            <p>{fulfillmentsDetails["trackingNumber"]}</p>
          </Stack>
          <Stack vertical={false} distribution="equalSpacing">
            <Heading>Created At</Heading>
            <p>{fulfillmentsDetails["createdAt"]}</p>
          </Stack>
          <Stack vertical={false} distribution="equalSpacing">
            <Heading>Updated At</Heading>
            <p>{fulfillmentsDetails["updatedAt"]}</p>
          </Stack>
        </Card>
      </Layout.Section>
    </Layout>
  ) : (
    <Banner title="Order not yet fulfilled" status="warning"></Banner>
  );
};
