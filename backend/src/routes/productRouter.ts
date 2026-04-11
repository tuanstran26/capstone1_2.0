
import express, { Request, Response } from "express";
import Product from "../models/Product"; // đường dẫn schema của bạn
import { ensureAuthenticated } from "../middlewares/authMiddleware";
import axios from "axios";

const router = express.Router();

// router.post("/create", ensureAuthenticated, async (req: Request, res: Response) => {
//     try {
//         const {
//             name,
//             slug,
//             description,
//             shortDescription,
//             price,
//             brand,
//             category,
//             inStock,
//             images,
//             status,
//             rating
//         } = req.body;

//         // Validate required fields
//         if (!name || !slug || !description || !shortDescription || !brand || !category) {
//             return res.status(400).json({
//                 message: "Missing required fields",
//             });
//         }

//         // Create Product Document
//         const newProduct = new Product({
//             name,
//             slug,
//             description,
//             shortDescription,
//             price: price || 0,
//             brand,
//             category,
//             inStock: inStock || 0,
//             images: images || [],
//             status: status || "active",
//             rating: rating || { avg: 0, count: 0 },
//         });

//         const savedProduct = await newProduct.save();

//         return res.status(201).json({
//             message: "Product created successfully",
//             product: savedProduct,
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({
//             message: "Error creating product",
//             error: err,
//         });
//     }
// });


router.post("/create", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const {
            name,
            slug,
            description,
            shortDescription,
            price,
            brand,
            category,
            inStock,
            images,
            status,
            rating
        } = req.body;

        // Validate required fields
        if (!name || !slug || !description || !shortDescription || !brand || !category) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // Default rating
        const avgRating = rating?.avg || 0;
        const reviewCount = rating?.count || 0;

        // Bayesian constants
        const C = 4;   // global average rating
        const m = 50;  // minimum review threshold

        // Bayesian Score
        const bayesianScore =
            (reviewCount / (reviewCount + m)) * avgRating +
            (m / (reviewCount + m)) * C;

        // Create Product
        const newProduct = new Product({
            name,
            slug,
            description,
            shortDescription,
            price: price || 0,
            brand,
            category,
            inStock: inStock || 0,
            images: images || [],
            status: status || "active",
            rating: {
                avg: avgRating,
                count: reviewCount
            },

            // Recommendation fields
            bayesianScore: bayesianScore,
            recommendedProducts: [],
            recommendationGenerated: false,
            recommendationGeneratedAt: null
        });

        const savedProduct = await newProduct.save();

        return res.status(201).json({
            message: "Product created successfully",
            product: savedProduct,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error creating product",
            error: err,
        });
    }
});


router.post("/get-related-products", async (req, res) => {
    try {
        const { id, category } = req.body;

        if (!id || !category) {
            return res.status(400).json({
                message: "id and category are required",
            });
        }

        const products = await Product.find({
            _id: { $ne: id },
            category: category,
            status: "active",
        })
            .sort({ bayesianScore: -1 })
            .limit(20)
            .select("name price images bayesianScore");

        const formattedProducts = products.map((p) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            bayesianScore: p.bayesianScore,
            image: p.images?.[0] || null,
        }));

        res.json(formattedProducts);
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching products",
            error: error.message,
        });
    }
});


router.post("/save-recommendations", async (req, res) => {
    try {
        const { productId, recommendations } = req.body;

        // ✅ Validate
        if (!productId || !Array.isArray(recommendations)) {
            return res.status(400).json({
                message: "productId and recommendations are required",
            });
        }

        if (recommendations.length === 0) {
            return res.status(400).json({
                message: "recommendations cannot be empty",
            });
        }

        // ✅ Format lại data cho đúng schema
        const formatted = recommendations.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            bayesianScore: p.bayesianScore,
            image: p.image || null,
        }));

        // ✅ Update vào product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                recommendedProducts: formatted,
                recommendationGenerated: true,
                recommendationGeneratedAt: new Date(),
            },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            message: "Recommendations saved successfully",
            data: updatedProduct.recommendedProducts,
        });

    } catch (error: any) {
        res.status(500).json({
            message: "Error saving recommendations",
            error: error.message,
        });
    }
});



router.get("/get-product", async (req, res) => {
    try {
        const products = await Product.find().select("-__v"); // bỏ __v nếu không cần

        res.json(products);

    } catch (error: any) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
});


router.get("/get-product/:id", async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(productId).select("-__v");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: "Error fetching product", error: err });
    }
});

router.get("/product-filter", async (req, res) => {
    try {
        const { brand, category } = req.query;

        const filter: any = {};

        if (brand) {
            const brandList = (brand as string).split(",");
            filter.brand = { $in: brandList };
        }

        if (category) {
            const categoryList = (category as string).split(",");
            filter.category = { $in: categoryList };
        }

        const products = await Product.find(filter);

        res.json(products);

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get("/search", async (req, res) => {
    try {
        console.log("Full query params:", req.query); // log toàn bộ

        const { keyword } = req.query;
        console.log("Search keyword:", keyword);

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Missing search keyword",
            });
        }

        // Tạo regex để search không phân biệt hoa thường
        const regex = new RegExp(keyword as string, "i");

        const products = await Product.find({
            name: { $regex: regex },
        });

        res.json(products);

    } catch (error) {
        console.error("Search product error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});


router.patch("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const allowedFields = [
            "name",
            "slug",
            "description",
            "shortDescription",
            "brand",
            "category",
            "inStock",
            "images",
            "status",
        ];

        // Lọc body chỉ lấy field hợp lệ
        let updateData: any = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct,
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});


router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product deleted successfully",
            product: deletedProduct,
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

const PYTHON_API = "http://localhost:6999/recommend-products";

router.post("/generate-all-recommendations", async (req, res) => {
    try {
        // 🔥 1. Lấy product chưa generate
        const products = await Product.find({
            recommendationGenerated: false,
            status: "active",
        }).select("_id name category");

        console.log(`Found ${products.length} products`);

        let success = 0;
        let failed = 0;

        // 🔥 2. Loop gọi Python API
        for (const product of products) {
            try {
                console.log("Processing:", product._id);

                await axios.post(
                    PYTHON_API,
                    {
                        id: product._id,
                        name: product.name,
                        category: product.category,
                    },
                    {
                        timeout: 15000, // tránh treo
                    }
                );

                success++;

            } catch (err: any) {
                console.error("Error:", product._id, err.message);
                failed++;
            }
        }

        res.json({
            message: "Done calling Python API",
            total: products.length,
            success,
            failed,
        });

    } catch (error: any) {
        res.status(500).json({
            message: "Batch error",
            error: error.message,
        });
    }
});


export default router;
