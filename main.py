import tkinter as tk
from tkinter import ttk
from algorithms import bellman_ford, floyd_warshall
from visualizer import draw_graph

# Graph Data
nodes = ["A", "B", "C", "D"]
edges = [
    (0,1,4), (0,2,2),
    (1,2,5), (1,3,10),
    (2,3,3)
]
V = len(nodes)

# Create matrix
def create_matrix():
    INF = float("inf")
    matrix = [[INF]*V for _ in range(V)]
    for i in range(V):
        matrix[i][i] = 0
    for u,v,w in edges:
        matrix[u][v] = w
    return matrix

# Path reconstruction
def get_path(parent, dest):
    path = []
    while dest != -1:
        path.append(dest)
        dest = parent[dest]
    return path[::-1]

# Run algorithm
def run():
    src = nodes.index(source_var.get())
    dest = nodes.index(dest_var.get())
    algo = algo_var.get()

    if algo == "Bellman-Ford":
        dist, parent, t = bellman_ford(edges, V, src)
        path = get_path(parent, dest)
        result.set(f"Distance: {dist[dest]}\nTime: {t:.6f}s\nPath: {' → '.join([nodes[i] for i in path])}")
        draw_graph(edges, path)

    else:
        matrix = create_matrix()
        dist, t = floyd_warshall(matrix)
        result.set(f"Distance: {dist[src][dest]}\nTime: {t:.6f}s\n(Path visualization uses Bellman-Ford)")
        
        # still show path using Bellman for visualization
        d, parent, _ = bellman_ford(edges, V, src)
        path = get_path(parent, dest)
        draw_graph(edges, path)

# GUI
root = tk.Tk()
root.title("Smart Route Optimizer")
root.geometry("400x300")

tk.Label(root, text="Source").pack()
source_var = tk.StringVar(value="A")
ttk.Combobox(root, textvariable=source_var, values=nodes).pack()

tk.Label(root, text="Destination").pack()
dest_var = tk.StringVar(value="D")
ttk.Combobox(root, textvariable=dest_var, values=nodes).pack()

tk.Label(root, text="Algorithm").pack()
algo_var = tk.StringVar(value="Bellman-Ford")
ttk.Combobox(root, textvariable=algo_var,
             values=["Bellman-Ford","Floyd-Warshall"]).pack()

tk.Button(root, text="Find Route", command=run).pack(pady=10)

result = tk.StringVar()
tk.Label(root, textvariable=result).pack()

root.mainloop()

