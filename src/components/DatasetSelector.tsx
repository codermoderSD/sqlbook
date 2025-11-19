import { useState } from "react";
import {
  IoCloseOutline,
  IoBriefcaseOutline,
  IoCartOutline,
  IoCameraOutline,
  IoFilmOutline,
} from "react-icons/io5";

interface DatasetSelectorProps {
  onSelect: (datasetKey: string) => void;
  onClose: () => void;
}

const DATASET_INFO = {
  employees: {
    name: "Employee Management",
    description: "HR database with employees, departments, and salaries",
    tables: ["employees", "departments"],
    icon: <IoBriefcaseOutline />,
  },
  ecommerce: {
    name: "E-commerce Platform",
    description: "Online store with customers, products, orders",
    tables: ["customers", "products", "orders", "order_items"],
    icon: <IoCartOutline />,
  },
  instagram: {
    name: "Instagram Clone",
    description: "Social media database with users, posts, comments, likes",
    tables: ["users", "posts", "comments", "follows", "likes"],
    icon: <IoCameraOutline />,
  },
  movies: {
    name: "Movie Database",
    description: "Film collection with actors, reviews, and cast",
    tables: ["movies", "actors", "movie_cast", "reviews"],
    icon: <IoFilmOutline />,
  },
};

export function DatasetSelector({ onSelect, onClose }: DatasetSelectorProps) {
  const [selectedDataset, setSelectedDataset] = useState<string>("");

  const handleSelect = () => {
    if (selectedDataset) {
      onSelect(selectedDataset);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a Dataset</h2>
          <button className="modal-close" onClick={onClose}>
            <IoCloseOutline />
          </button>
        </div>

        <div className="dataset-grid">
          {Object.entries(DATASET_INFO).map(([key, info]) => (
            <div
              key={key}
              className={`dataset-card ${
                selectedDataset === key ? "selected" : ""
              }`}
              onClick={() => setSelectedDataset(key)}
            >
              <div className="dataset-icon">{info.icon}</div>
              <h3>{info.name}</h3>
              <p>{info.description}</p>
              <div className="dataset-tables">
                <strong>Tables:</strong> {info.tables.join(", ")}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSelect}
            disabled={!selectedDataset}
          >
            Load Dataset
          </button>
        </div>
      </div>
    </div>
  );
}
