import React from 'react';
import { Link } from 'react-router-dom';
import { snippet } from '../../data/sitePages';

const ArticleCard = ({ article }) => (
    <Link to={`/article/${article.id}`} className="abl-pub-article">
        {article.image && <img src={article.image} alt="" loading="lazy" />}
        <div>
            <h3>{article.title}</h3>
            <p>{snippet(article.content, 90)}</p>
        </div>
    </Link>
);

export default ArticleCard;
