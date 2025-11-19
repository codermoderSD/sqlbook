<!-- add logo of sqlbook -->

[![SQLBook Logo](./public/sqlbook.png)](#)

# SQLBook

A web application that allows users to write and execute SQL queries directly in their browser using WebAssembly (WASM) technology. It provides an interactive environment for learning and practicing SQL without the need for any server-side setup.

## Features

- Execute SQL queries in the browser using a WASM-based SQL engine.
- Interactive code editor with syntax highlighting and auto-completion.
- View query results in a tabular format.
- No server-side dependencies; all processing is done client-side.
- Load your own csv files to create tables and run queries against them.
- Export the results of your queries as csv files.

## Technologies Used

- React: Frontend library for building user interfaces.
- SQL.js: WASM-based SQL engine for executing SQL queries in the browser.
- CodeMirror: Code editor component with SQL syntax support.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sqlbook.git
    cd sqlbook
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` to use the application.

## Usage

1. Write your SQL queries in the code editor.
2. Click the "Run" button to execute the queries.
3. View the results displayed below the editor.
4. Modify and re-run queries as needed.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the developers of SQL.js and CodeMirror for their amazing libraries that made this project possible.
