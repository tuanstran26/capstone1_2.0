import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;

    description: string;
    shortDescription: string;
    price: number;
    brand: string;
    category: string;
    inStock: number;

    images: {
        url: string;
        alt: string;
    }[];

    status: "active" | "inactive" | "archived";

    rating: {
        avg: number;
        count: number;
    };

    // Recommendation system fields
    bayesianScore: number;

    recommendedProducts: mongoose.Types.ObjectId[];

    recommendationGenerated: boolean;

    recommendationGeneratedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: { type: String, required: true },

        shortDescription: { type: String, required: true },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        brand: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        inStock: {
            type: Number,
            required: true,
            min: 0,
        },

        images: [
            {
                url: { type: String, required: true },
                alt: { type: String, required: true },
            },
        ],

        status: {
            type: String,
            enum: ["active", "inactive", "archived"],
            default: "active",
        },

        rating: {
            avg: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
        },

        // Bayesian score used for statistical ranking
        bayesianScore: {
            type: Number,
            default: 0,
        },

        // GPT recommended products
        recommendedProducts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        // Flag to avoid generating recommendations multiple times
        recommendationGenerated: {
            type: Boolean,
            default: false,
        },

        // Timestamp when recommendation was generated
        recommendationGeneratedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IProduct>("Product", ProductSchema);