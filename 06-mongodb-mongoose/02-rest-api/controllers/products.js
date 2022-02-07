const Product = require('../models/Product');
const mapProduct = require('../mappers/product');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const {subcategory} = ctx.query;

  if (!subcategory) return next();

  const list = await Product.find({subcategory: subcategory}).populate('category');

  ctx.body = {
    products: list.map(mapProduct),
  };
};

module.exports.productList = async function productList(ctx, next) {
  const list = await Product.find({}).populate('category');

  ctx.body = {
    products: list.map(mapProduct),
  };
};

module.exports.productById = async function productById(ctx, next) {
  const {id} = ctx.params;
  let product;

  if (!id) {
    ctx.throw(404);
  }

  try {
    product = await Product.findOne({_id: id});
  } catch (error) {
    ctx.throw(400);
  }

  if (!product) {
    ctx.throw(404);
  }

  ctx.body = {
    product: mapProduct(product),
  };
};

