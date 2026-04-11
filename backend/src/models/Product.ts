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

    recommendedProducts: IRecommendedProduct[];

    recommendationGenerated: boolean;

    recommendationGeneratedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRecommendedProduct {
    id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    bayesianScore: number;
    image: {
        url: string;
        alt: string;
    } | null;
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

        recommendedProducts: [
            {
                id: {
                    type: Schema.Types.ObjectId,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                bayesianScore: {
                    type: Number,
                    required: true,
                },
                image: {
                    url: { type: String },
                    alt: { type: String },
                },
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