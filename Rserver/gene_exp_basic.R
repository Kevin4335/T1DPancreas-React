#!/usr/bin/env Rscript

# Barebones gene expression plotting script used to reproduce
# the high-memory full-data path (no downsampling).
#
# Default test case:
#   genes: INS
#   cell types: Alpha
#
# Output:
#   ./gene_exp_basic_output.png (in this same directory)

suppressPackageStartupMessages({
  library(Seurat)
  library(ggplot2)
  library(patchwork)
})

# -----------------------------
# Config
# -----------------------------
rds_path <- "/mnt/mountpoint/T1D_Cosmx_new/rds/ECSL7731_annotated.rds"
output_png <- "gene_exp_basic_output.png"

# For reproducibility and clear demonstration
genes_csv <- "INS"
cell_types_csv <- "Alpha"

# -----------------------------
# Helpers
# -----------------------------
pick_meta_col <- function(md, candidates, required = TRUE) {
  cols <- colnames(md)
  hit <- candidates[candidates %in% cols]
  if (length(hit) > 0) return(hit[[1]])
  if (!required) return(NULL)
  stop(sprintf("Missing required metadata col. Tried: %s", paste(candidates, collapse = ", ")))
}

pick_reduction <- function(object, candidates = c("umap", "umap_harmony", "umap_pca", "harmony", "pca")) {
  available <- names(object@reductions)
  hit <- candidates[candidates %in% available]
  if (length(hit) > 0) return(hit[[1]])
  if (length(available) > 0) return(available[[1]])
  stop("No dimensional reduction found in Seurat object.")
}

# Canonical palette used by current app
labels <- c(
  "Acinar","Alpha","B cell","Beta","Delta+Gamma","Dendritic cell","Ductal","Endothelial",
  "Fibroblast","Macrophage","Mast cell","Mesenchymal+Endothelial","Monocyte","NK cell",
  "Pericytes","Polyhormonal","T cell","Unknown"
)
cols <- c(
  "#F8766D","#CD9600","#8B4513","#7CAE00","#00BE67","#2E8B57","#00BFC4","#00A9FF",
  "#B8860B","#4682B4","#A0522D","#FF61CC","#D2691E","#FF4500","#556B2F","#8A2BE2",
  "#FF1493","#FFACBC"
)

make_celltype_palette <- function(celltypes) {
  celltypes <- unique(as.character(celltypes))
  base_map <- stats::setNames(cols, labels)
  missing_types <- setdiff(celltypes, names(base_map))
  if (length(missing_types) > 0) {
    extra_cols <- grDevices::hcl.colors(length(missing_types), palette = "Dynamic")
    names(extra_cols) <- missing_types
    base_map <- c(base_map, extra_cols)
  }
  base_map[celltypes]
}

normalize_label <- function(x) {
  tolower(gsub("[^a-z0-9]", "", as.character(x)))
}

resolve_requested_labels <- function(requested, available) {
  requested <- trimws(as.character(requested))
  available <- as.character(available)
  alias_pairs <- c(
    "bcell" = "bcell", "bcells" = "bcell",
    "dendriticcell" = "dendriticcell", "dendriticcells" = "dendriticcell",
    "macrophage" = "macrophage", "macrophages" = "macrophage",
    "monocyte" = "monocyte", "monocytes" = "monocyte",
    "nkcell" = "nkcell", "nkcells" = "nkcell",
    "tcell" = "tcell", "tcells" = "tcell",
    "deltagamma" = "deltagamma",
    "mesenchymalendothelial" = "mesenchymalendothelial"
  )
  norm_available <- normalize_label(available)
  norm_available <- ifelse(norm_available %in% names(alias_pairs), alias_pairs[norm_available], norm_available)
  names(available) <- norm_available
  norm_requested <- normalize_label(requested)
  norm_requested <- ifelse(norm_requested %in% names(alias_pairs), alias_pairs[norm_requested], norm_requested)
  resolved <- available[norm_requested]
  unresolved <- requested[is.na(resolved) | resolved == ""]
  list(
    resolved = unname(resolved[!(is.na(resolved) | resolved == "")]),
    unresolved = unresolved
  )
}

# -----------------------------
# Load object
# -----------------------------
cat(sprintf("Loading object from: %s\n", rds_path))
obj <- readRDS(rds_path)
md <- obj@meta.data

cell_col <- pick_meta_col(md, c("all_celltypes", "All_Cell_Type", "all_cell_types", "cell_type"))
slide_col <- pick_meta_col(md, c("slide", "Slide"), required = FALSE)
reduction_name <- pick_reduction(obj)

genes <- strsplit(genes_csv, ",")[[1]]
genes <- trimws(genes)
cell_types <- strsplit(cell_types_csv, ",")[[1]]
cell_types <- trimws(cell_types)

if (!all(genes %in% rownames(obj))) {
  bad <- genes[!genes %in% rownames(obj)]
  stop(sprintf("Invalid genes: %s", paste(bad, collapse = ", ")))
}

valid_celltypes <- unique(as.character(md[[cell_col]]))
resolved_types <- resolve_requested_labels(cell_types, valid_celltypes)
if (length(resolved_types$unresolved) > 0) {
  bad <- resolved_types$unresolved
  stop(sprintf("Invalid cell types: %s", paste(bad, collapse = ", ")))
}
cell_types <- unique(resolved_types$resolved)

palette_map <- make_celltype_palette(valid_celltypes)

# -----------------------------
# FULL-DATA plotting path
# (intentionally no downsampling)
# -----------------------------
cat(sprintf("Cells in object: %d\n", length(Cells(obj))))
selected_cells <- rownames(md[md[[cell_col]] %in% cell_types, , drop = FALSE])
cat(sprintf("Cells in selected cell type subset: %d\n", length(selected_cells)))
obj_cell_subset <- subset(obj, cells = selected_cells)

png(output_png, width = 1600, height = 800)
on.exit({
  try(dev.off(), silent = TRUE)
}, add = TRUE)

p0 <- DimPlot(
  obj,
  reduction = reduction_name,
  label = FALSE,
  cols = palette_map,
  pt.size = 1,
  alpha = 0.8,
  group.by = cell_col,
  raster = TRUE
) +
  guides(color = guide_legend(override.aes = list(size = 8), ncol = 1)) +
  theme(
    plot.title = element_blank(),
    legend.position = "right",
    legend.text = element_text(face = "bold", color = "Black", size = 14, family = "serif")
  )
p0 <- LabelClusters(p0, id = cell_col, fontface = "bold", color = "Black", size = 5, family = "serif")

p1 <- DotPlot(
  obj_cell_subset,
  features = genes,
  group.by = ifelse(is.null(slide_col), cell_col, slide_col)
) +
  scale_colour_gradient2(low = "#000000", mid = "orange", high = "red") +
  scale_size(range = c(2, 12)) +
  labs(x = NULL, y = NULL, fill = "avg.exp") +
  coord_flip() +
  theme(
    legend.direction = "vertical",
    legend.position = "right",
    legend.text = element_text(color = "Black", size = 10, family = "serif"),
    axis.text.x = element_text(face = "bold", color = "Black", size = 14, family = "serif"),
    axis.text.y = element_text(face = "bold", color = "Black", size = 14, family = "serif")
  ) +
  guides(size = guide_legend(ncol = 1, title = "pct.exp")) +
  guides(color = guide_colorbar(title = "avg.exp"))

# Keep it simple: exactly two side-by-side plots.
print(p0 + p1 + plot_layout(ncol = 2, widths = c(1.4, 1)))

dev.off()
cat(sprintf("Wrote output: %s\n", output_png))
