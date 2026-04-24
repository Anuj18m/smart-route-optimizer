import networkx as nx
import matplotlib.pyplot as plt

def draw_graph(edges, path=[]):
    G = nx.DiGraph()

    for u, v, w in edges:
        G.add_edge(u, v, weight=w)

    pos = nx.kamada_kawai_layout(G)

    labels = {0:"A", 1:"B", 2:"C", 3:"D"}

    nx.draw(G, pos, labels=labels,
            with_labels=True,
            node_color='skyblue',
            node_size=2000)

    edge_labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

    if path:
        path_edges = list(zip(path, path[1:]))
        nx.draw_networkx_edges(G, pos,
                               edgelist=path_edges,
                               edge_color='red',
                               width=3)

    plt.title("Route Visualization")
    plt.show()
    