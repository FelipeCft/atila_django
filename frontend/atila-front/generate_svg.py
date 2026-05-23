import random

def generate_poly_svg(filename, width=1920, height=1080, cell_size=80, variance=0.6):
    cols = int(width / cell_size) + 1
    rows = int(height / cell_size) + 1
    
    # Generate points with random variance
    points = []
    for r in range(rows + 1):
        row_points = []
        for c in range(cols + 1):
            x = c * cell_size + (random.random() - 0.5) * cell_size * variance
            y = r * cell_size + (random.random() - 0.5) * cell_size * variance
            row_points.append((x, y))
        points.append(row_points)
    
    svg_header = f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">\n'
    svg_header += '  <rect width="100%" height="100%" fill="#fcfcfc" />\n'
    
    triangles = []
    for r in range(rows):
        for c in range(cols):
            p1 = points[r][c]
            p2 = points[r][c+1]
            p3 = points[r+1][c]
            p4 = points[r+1][c+1]
            
            # Divide each quad into two triangles
            if random.random() > 0.5:
                triangles.append((p1, p2, p3))
                triangles.append((p2, p3, p4))
            else:
                triangles.append((p1, p2, p4))
                triangles.append((p1, p3, p4))
                
    svg_content = ""
    for tri in triangles:
        # Grayscale color with more contrast (wider range)
        gray = random.randint(180, 255)
        color = f'rgb({gray}, {gray}, {gray})'
        points_str = " ".join([f"{p[0]:.1f},{p[1]:.1f}" for p in tri])
        svg_content += f'  <polygon points="{points_str}" fill="{color}" stroke="{color}" stroke-width="0.5" />\n'
        
    svg_footer = '</svg>'
    
    with open(filename, 'w') as f:
        f.write(svg_header + svg_content + svg_footer)

if __name__ == "__main__":
    output_path = "src/assets/triangular-background.svg"
    generate_poly_svg(output_path)
    print(f"SVG generated successfully at {output_path}")
