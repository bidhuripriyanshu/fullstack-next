export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{ background: "teal" }}>Application Header</header>
        {children}
        <footer style={{ background: "brown" }}>Application Footer</footer>
      </body>
    </html>
  );
}