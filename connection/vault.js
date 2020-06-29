module.exports.config = async () => {
  require("dotenv").config();

  const token = Buffer.from(process.env.VAULT_ROOT_TOKEN, "base64").toString("utf-8");
  const NODE_ENV = process.env.NODE_ENV;

  const options = {
    token,
    endpoint: process.env.VAULT_URL,
    apiVersion: "v1"
  };

  const vault = require("node-vault")(options);

  const { data: mongoDBCreds } = await vault.read("kv/mongodb-creds");
  const { data: actyvExtras } = await vault.read("kv/actyv-extras");

  if (NODE_ENV === "PROD") {
    const {
      MONGODB_PROD_USERNAME,
      MONGODB_PROD_PASSWORD,
      PROD_DB_NAME,
      MONGODB_PROD_HOST
    } = mongoDBCreds;

    const mongoURI =
      `mongodb+srv://${MONGODB_PROD_USERNAME}:${MONGODB_PROD_PASSWORD}@${MONGODB_PROD_HOST}/${PROD_DB_NAME}?retryWrites=true&w=majority`;

    process.env.mongoURI = mongoURI;

    const { ELASTICSEARCH_PROD } = actyvExtras;
    process.env.ELASTIC_LOGSTASH_URL = ELASTICSEARCH_PROD;
  } else {
    const {
      MONGODB_DEV_USERNAME,
      MONGODB_DEV_PASSWORD,
      DEV_DB_NAME,
      MONGODB_DEV_HOST,
      MONGODB_DEV_PORT
    } = mongoDBCreds;

    const mongoURI =
      `mongodb://${MONGODB_DEV_USERNAME}:${MONGODB_DEV_PASSWORD}@${MONGODB_DEV_HOST}:${MONGODB_DEV_PORT}/${DEV_DB_NAME}`;

    process.env.mongoURI = mongoURI;

    const { ELASTICSEARCH_DEV } = actyvExtras;
    process.env.ELASTIC_LOGSTASH_URL = ELASTICSEARCH_DEV;
  }

  const { data: jwtConfig } = await vault.read("kv/jwt");
  const { JWT_SECRET } = jwtConfig;
  process.env.JWT_SECRET = JWT_SECRET;
};
