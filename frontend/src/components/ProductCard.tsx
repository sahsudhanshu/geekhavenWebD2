import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import styles from './ProductCard.module.css';
import { seededChecksum } from '../utils/seed';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Use a placeholder if no image URL is provided
    const imageUrl = product.image || 'https://via.placeholder.com/250';

    const displayId = seededChecksum(String(product.id));
    return (
        // Link the entire card to the product's detail page
        <Link to={`/products/${product.id}`} className={styles.card}>
            <div className={styles.cardImageContainer}>
                <img src={imageUrl} alt={product.title} className={styles.cardImage} />
            </div>
            <div className={styles.cardBody}>
                <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400">ID {displayId}</span>
                <p className={styles.cardCategory}>{product.category}</p>
                <h3 className={styles.cardTitle}>{product.title}</h3>
                <p className={styles.cardPrice}>${product.price.toFixed(2)}</p>
            </div>
        </Link>
    );
};

export default ProductCard;