# The Dependency Graph as Knowledge Graph

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣤⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣶⣿⣿⣿⣿⠟⠋⠉⠉⠙⠻⣿⣿⣿⣿⣶⣦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣴⣿⣿⣿⠿⠛⠉⣿⣿⠃⠀⠀⠀⢀⣀⣀⡀⠀⠀⠀⠘⣿⣿⡉⠛⠿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣼⣿⡿⠋⠁⠀⠀⠀⣿⣿⠀⠀⠀⢰⣿⣿⣿⣿⡆⠀⠀⠀⣿⣿⠀⠀⠀⠈⠙⢿⣿⣧⠀⠀⠀⠀⠀⠀⠀
⠀⢰⣿⡟⠀⠀⠀⠀⠀⠀⣿⣿⡀⠀⠀⠈⠻⣿⣿⠟⠁⠀⠀⢀⣿⣿⠀⠀⠀⠀⠀⠀⢻⣿⡆⠀⠀⠀⠀⠀⠀
⠀⣿⣿⠁⠀⠀⠀⠀⠀⠀⠸⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⠇⠀⠀⠀⠀⠀⠀⠈⣿⣿⠀⠀⠀⠀⠀⠀
⠀⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣷⣶⣤⣤⣤⣶⣶⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⠀⠀⠀⠀
⠀⢿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⢿⣿⣿⡿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡿⠀⠀⠀⠀⠀⠀
⠀⠘⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⠃⠀⠀⠀⠀⠀⠀
⠀⠀⠘⢿⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠙⠿⣿⣿⣶⣤⣄⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣄⣠⣤⣶⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠟⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

When Vannevar Bush described the Memex in 1945, he imagined a device where a researcher could leave "trails" through information — associative paths that connected disparate documents into coherent narratives. The hyperlink, invented decades later, was a crude approximation. But Bush's deeper insight was that knowledge isn't a hierarchy; it's a graph.

Your dependency list is a knowledge graph in disguise. Xcode CLI Tools connects to the history of Unix and the C programming language. Homebrew connects to the philosophy of package management that started with Debian's apt in 1998. Node.js connects to the event loop model borrowed from Nginx, which itself drew from research on the C10K problem. Each tool is a node; each "depends on" relationship is an edge.

The librarian-style articles we're adding aren't documentation — they're trails. When someone clicks on "Git," they shouldn't just learn what Git does. They should glimpse why Linus Torvalds rejected CVS, how BitKeeper's licensing dispute forced his hand, and why content-addressable storage (the same principle behind IPFS and blockchain) makes distributed version control possible.

This is the difference between a manual and a mentor. A manual tells you how. A mentor tells you why, and connects the why to everything else you might care about.
