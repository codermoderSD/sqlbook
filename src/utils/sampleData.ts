export const SAMPLE_DATASETS = {
  employees: `
-- Employee Management Database
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  location TEXT
);

CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  dept_id INTEGER,
  salary REAL,
  hire_date TEXT,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

INSERT INTO departments VALUES (1, 'Engineering', 'San Francisco');
INSERT INTO departments VALUES (2, 'Marketing', 'New York');
INSERT INTO departments VALUES (3, 'Sales', 'Chicago');
INSERT INTO departments VALUES (4, 'HR', 'Boston');

INSERT INTO employees VALUES (1, 'Alice', 'Johnson', 'alice@company.com', 1, 95000, '2020-01-15');
INSERT INTO employees VALUES (2, 'Bob', 'Smith', 'bob@company.com', 1, 87000, '2020-03-22');
INSERT INTO employees VALUES (3, 'Charlie', 'Brown', 'charlie@company.com', 2, 72000, '2019-07-10');
INSERT INTO employees VALUES (4, 'Diana', 'Davis', 'diana@company.com', 3, 81000, '2021-02-01');
INSERT INTO employees VALUES (5, 'Eve', 'Wilson', 'eve@company.com', 2, 68000, '2021-05-12');
INSERT INTO employees VALUES (6, 'Frank', 'Miller', 'frank@company.com', 1, 92000, '2018-11-30');
INSERT INTO employees VALUES (7, 'Grace', 'Lee', 'grace@company.com', 4, 65000, '2022-01-18');
INSERT INTO employees VALUES (8, 'Henry', 'Taylor', 'henry@company.com', 3, 78000, '2020-09-05');
  `,

  ecommerce: `
-- E-commerce Database
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  city TEXT,
  signup_date TEXT
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT,
  price REAL
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT,
  total_amount REAL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO customers VALUES (1, 'John Doe', 'john@email.com', 'Seattle', '2023-01-10');
INSERT INTO customers VALUES (2, 'Jane Smith', 'jane@email.com', 'Portland', '2023-02-15');
INSERT INTO customers VALUES (3, 'Mike Johnson', 'mike@email.com', 'Austin', '2023-03-20');

INSERT INTO products VALUES (1, 'Laptop', 'Electronics', 999.99);
INSERT INTO products VALUES (2, 'Wireless Mouse', 'Electronics', 29.99);
INSERT INTO products VALUES (3, 'Desk Chair', 'Furniture', 249.99);
INSERT INTO products VALUES (4, 'Monitor', 'Electronics', 399.99);
INSERT INTO products VALUES (5, 'Keyboard', 'Electronics', 79.99);

INSERT INTO orders VALUES (1, 1, '2023-04-01', 1029.98);
INSERT INTO orders VALUES (2, 2, '2023-04-05', 649.98);
INSERT INTO orders VALUES (3, 1, '2023-04-10', 29.99);
INSERT INTO orders VALUES (4, 3, '2023-04-12', 479.98);

INSERT INTO order_items VALUES (1, 1, 1, 1);
INSERT INTO order_items VALUES (2, 1, 2, 1);
INSERT INTO order_items VALUES (3, 2, 3, 1);
INSERT INTO order_items VALUES (4, 2, 4, 1);
INSERT INTO order_items VALUES (5, 3, 2, 1);
INSERT INTO order_items VALUES (6, 4, 4, 1);
INSERT INTO order_items VALUES (7, 4, 5, 1);
  `,

  instagram: `
-- Instagram Clone Database
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  profile_pic_url TEXT,
  created_at TEXT
);

CREATE TABLE posts (
  post_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  image_url TEXT,
  caption TEXT,
  created_at TEXT,
  likes_count INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE comments (
  comment_id INTEGER PRIMARY KEY,
  post_id INTEGER,
  user_id INTEGER,
  comment_text TEXT,
  created_at TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(post_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE follows (
  follower_id INTEGER,
  following_id INTEGER,
  created_at TEXT,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(user_id),
  FOREIGN KEY (following_id) REFERENCES users(user_id)
);

CREATE TABLE likes (
  user_id INTEGER,
  post_id INTEGER,
  created_at TEXT,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id)
);

INSERT INTO users VALUES (1, 'sarah_k', 'Sarah Kim', 'Travel photographer 📸', 'https://i.pravatar.cc/150?u=1', '2023-01-15');
INSERT INTO users VALUES (2, 'mike_dev', 'Mike Johnson', 'Full-stack developer 💻', 'https://i.pravatar.cc/150?u=2', '2023-02-10');
INSERT INTO users VALUES (3, 'emma_art', 'Emma Watson', 'Digital artist 🎨', 'https://i.pravatar.cc/150?u=3', '2023-03-05');
INSERT INTO users VALUES (4, 'john_fit', 'John Smith', 'Fitness coach 💪', 'https://i.pravatar.cc/150?u=4', '2023-04-12');
INSERT INTO users VALUES (5, 'lisa_food', 'Lisa Brown', 'Food blogger 🍕', 'https://i.pravatar.cc/150?u=5', '2023-05-20');

INSERT INTO posts VALUES (1, 1, 'https://picsum.photos/400/400?1', 'Sunset in Bali 🌅', '2024-01-20', 142);
INSERT INTO posts VALUES (2, 2, 'https://picsum.photos/400/400?2', 'New project launch! 🚀', '2024-01-22', 89);
INSERT INTO posts VALUES (3, 3, 'https://picsum.photos/400/400?3', 'Latest artwork ✨', '2024-01-24', 203);
INSERT INTO posts VALUES (4, 1, 'https://picsum.photos/400/400?4', 'Tokyo nights 🗼', '2024-01-25', 156);
INSERT INTO posts VALUES (5, 4, 'https://picsum.photos/400/400?5', 'Morning workout routine', '2024-01-26', 97);
INSERT INTO posts VALUES (6, 5, 'https://picsum.photos/400/400?6', 'Best pizza in town! 🍕', '2024-01-27', 178);

INSERT INTO comments VALUES (1, 1, 2, 'Amazing shot!', '2024-01-20 10:30:00');
INSERT INTO comments VALUES (2, 1, 3, 'Love the colors 😍', '2024-01-20 11:15:00');
INSERT INTO comments VALUES (3, 2, 1, 'Congrats! 🎉', '2024-01-22 14:20:00');
INSERT INTO comments VALUES (4, 3, 4, 'Incredible work!', '2024-01-24 09:45:00');
INSERT INTO comments VALUES (5, 6, 2, 'Looks delicious!', '2024-01-27 19:30:00');

INSERT INTO follows VALUES (1, 2, '2024-01-10');
INSERT INTO follows VALUES (1, 3, '2024-01-11');
INSERT INTO follows VALUES (2, 1, '2024-01-12');
INSERT INTO follows VALUES (2, 3, '2024-01-13');
INSERT INTO follows VALUES (3, 1, '2024-01-14');
INSERT INTO follows VALUES (3, 4, '2024-01-15');
INSERT INTO follows VALUES (4, 5, '2024-01-16');
INSERT INTO follows VALUES (5, 1, '2024-01-17');

INSERT INTO likes VALUES (2, 1, '2024-01-20 10:00:00');
INSERT INTO likes VALUES (3, 1, '2024-01-20 10:30:00');
INSERT INTO likes VALUES (1, 2, '2024-01-22 14:00:00');
INSERT INTO likes VALUES (4, 3, '2024-01-24 09:00:00');
INSERT INTO likes VALUES (2, 6, '2024-01-27 19:00:00');
  `,

  movies: `
-- Movie Database
CREATE TABLE movies (
  movie_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  release_year INTEGER,
  genre TEXT,
  director TEXT,
  rating REAL,
  duration_minutes INTEGER
);

CREATE TABLE actors (
  actor_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INTEGER,
  nationality TEXT
);

CREATE TABLE movie_cast (
  movie_id INTEGER,
  actor_id INTEGER,
  role_name TEXT,
  PRIMARY KEY (movie_id, actor_id),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (actor_id) REFERENCES actors(actor_id)
);

CREATE TABLE reviews (
  review_id INTEGER PRIMARY KEY,
  movie_id INTEGER,
  reviewer_name TEXT,
  rating INTEGER,
  review_text TEXT,
  review_date TEXT,
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

INSERT INTO movies VALUES (1, 'The Shawshank Redemption', 1994, 'Drama', 'Frank Darabont', 9.3, 142);
INSERT INTO movies VALUES (2, 'The Dark Knight', 2008, 'Action', 'Christopher Nolan', 9.0, 152);
INSERT INTO movies VALUES (3, 'Inception', 2010, 'Sci-Fi', 'Christopher Nolan', 8.8, 148);
INSERT INTO movies VALUES (4, 'Pulp Fiction', 1994, 'Crime', 'Quentin Tarantino', 8.9, 154);
INSERT INTO movies VALUES (5, 'Forrest Gump', 1994, 'Drama', 'Robert Zemeckis', 8.8, 142);

INSERT INTO actors VALUES (1, 'Morgan Freeman', 1937, 'American');
INSERT INTO actors VALUES (2, 'Tim Robbins', 1958, 'American');
INSERT INTO actors VALUES (3, 'Christian Bale', 1974, 'British');
INSERT INTO actors VALUES (4, 'Heath Ledger', 1979, 'Australian');
INSERT INTO actors VALUES (5, 'Leonardo DiCaprio', 1974, 'American');
INSERT INTO actors VALUES (6, 'Tom Hanks', 1956, 'American');
INSERT INTO actors VALUES (7, 'John Travolta', 1954, 'American');

INSERT INTO movie_cast VALUES (1, 1, 'Red');
INSERT INTO movie_cast VALUES (1, 2, 'Andy Dufresne');
INSERT INTO movie_cast VALUES (2, 3, 'Bruce Wayne');
INSERT INTO movie_cast VALUES (2, 4, 'Joker');
INSERT INTO movie_cast VALUES (3, 5, 'Dom Cobb');
INSERT INTO movie_cast VALUES (4, 7, 'Vincent Vega');
INSERT INTO movie_cast VALUES (5, 6, 'Forrest Gump');

INSERT INTO reviews VALUES (1, 1, 'John S.', 10, 'Masterpiece! A must-watch.', '2024-01-15');
INSERT INTO reviews VALUES (2, 2, 'Emma T.', 9, 'Best superhero movie ever made.', '2024-01-16');
INSERT INTO reviews VALUES (3, 3, 'Mike R.', 9, 'Mind-bending and brilliant!', '2024-01-17');
INSERT INTO reviews VALUES (4, 5, 'Sarah L.', 10, 'Heartwarming and inspiring.', '2024-01-18');
  `,
};

export const DEFAULT_NOTEBOOK = [
  {
    type: "sql" as const,
    content:
      "-- Welcome to SQLBook - Interactive SQL Learning\n-- View table structures in the Schema panel, browse data in Data Preview\n-- Write queries below and click the green Run button to execute\n\n-- Example: View all customers\nSELECT * FROM customers\nLIMIT 5;",
  },
];
