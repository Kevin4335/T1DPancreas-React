library(Seurat)
library(ggplot2)
library(RColorBrewer)
library(magrittr)
library(sf) # jtc
library(patchwork)


library(httpuv) # jtc
library(jsonlite) # jtc
obj <- readRDS("/mnt/mountpoint/T1D_Cosmx/RDS_files/cosmx_SL-15dims.rds")

col <- c(
  "#F8766D", # Acinar
  "#CD9600", # Alpha
  "#7CAE00", # Beta
  "#00BE67", # Delta
  "#00BFC4", # Ductal
  "#00A9FF", # Endothelial
  "#FF61CC", # Mesenchymal
  "#8B4513", # B cells
  "#2E8B57", # Dendritic cells
  "#4682B4", # Macrophages
  "#D2691E", # Monocytes
  "#6A5ACD", # Granulocytes
  "#FF4500", # NK cells
  "#556B2F", # Pre-B cells
  "#FF1493",  # T cells
  "#FFACBC" # Unknown
)

labels <- c(
  "Acinar", "Alpha", "Beta", "Delta", "Ductal", "Endothelial", "Mesenchymal",
  "B cells",  "Dendritic cells", "Macrophages", "Monocytes", "Granulocytes", 
  "NK cells", "Pre-B cells", "T cells",  "Unknown"
)

### functions for expression page
exp_func <- function(Igene, IcellType) {
  gene_list <- strsplit(Igene, split = ',')[[1]]
  celltype_list <- strsplit(IcellType, split = ',')[[1]]

  if (!all(gene_list %in% rownames(obj))) {
    cat("Invalid genes:", gene_list[!gene_list %in% rownames(obj)], "\n")
    stop("One or more genes not found in dataset.")
  }

  valid_celltypes <- unique(obj$all_celltypes)
  if (!all(celltype_list %in% valid_celltypes)) {
    cat("Invalid cell types:", celltype_list[!celltype_list %in% valid_celltypes], "\n")
    stop("One or more cell types not found.")
  }
  ## Igene should be string containing at least one gene, such as "COL1A1","CD68"
  ## IcellType should be string containing at least one cell type, such as "1:Macro","2:Fibro"
  if (is.null(Igene)) {
    cat("Please input at least one gene!")
    return(NULL)
  } else if (is.null(IcellType)) {
    cat("Please select the cell type!")
    return(NULL)
  }

  # Create PNG output file
  outfile <- tempfile(fileext = ".png")
  png(outfile, width = 1200, height = 800)
  on.exit({
    try(dev.off(), silent = TRUE)
  }, add = TRUE)

  gene_list <- strsplit(Igene, split = ',')[[1]]
  celltype_list <- strsplit(IcellType, split = ',')[[1]]

  p0 <- DimPlot(obj, reduction = "umap", label = FALSE, label.size = 6, cols = col, 
                label.color = "black", pt.size = 1, alpha = 0.8, group.by = "all_celltypes") +
    guides(color = guide_legend(override.aes = list(size = 8), ncol = 1)) +
    scale_color_manual(values = col, labels = labels) +
    theme(plot.title = element_blank(),
          legend.position = "right",
          legend.text = element_text(face = "bold", color = "Black", size = 18, family = "serif"))
  p0 <- LabelClusters(p0, id = "all_celltypes", fontface = "bold", color = "Black", size = 8, family = "serif")

  p1 <- DotPlot(subset(obj, subset = all_celltypes %in% celltype_list),
                features = gene_list, group.by = "slide") +
    scale_colour_gradient2(low = "#000000", mid = "orange", high = "red") +
    scale_size(range = c(1, 10)) +
    labs(x = NULL, y = NULL, fill = "avg.exp") +
    scale_y_discrete(breaks = c("Control", "AB_plus_LN_minus", "AB_plus_LN_plus", "T1D"),
                     labels = c("Control", "AB+LN-", "AB+LN+", "T1D")) +
    coord_flip() +
    theme(axis.text.x = element_text(color = "Black", size = 8, hjust = 1, vjust = 1, angle = 30),
          legend.direction = "vertical", legend.position = "right") +
    guides(size = guide_legend(ncol = 1, title = "pct.exp")) +
    guides(color = guide_colorbar(title = "avg.exp")) +
    theme(legend.text = element_text(color = "Black", size = 10, family = "serif"),
          axis.text.x = element_text(face = "bold", color = "Black", size = 18, family = "serif", angle = 0, hjust = 0.5),
          axis.text.y = element_text(face = "bold", color = "Black", size = 18, family = "serif", angle = 90, hjust = 0.5))

  if (length(gene_list) == 1) {
    print(p0 + p1 + plot_layout(ncol = 2, widths = c(1.4, 1)))  # gives p0 more breathing room
  } else {
    p2 <- DotPlot(subset(obj, subset = all_celltypes %in% celltype_list),
                  features = gene_list, group.by = "all_celltypes") +
      scale_colour_gradient2(low = "#000000", mid = "orange", high = "red") +
      scale_size(range = c(1, 10)) +
      labs(x = NULL, y = NULL, fill = "avg.exp") +
      coord_flip() +
      theme(axis.text.x = element_text(color = "Black", size = 8, hjust = 1, vjust = 1, angle = 30),
            legend.direction = "vertical", legend.position = "right") +
      guides(size = guide_legend(ncol = 1, title = "pct.exp")) +
      guides(color = guide_colorbar(title = "avg.exp")) +
      theme(legend.text = element_text(color = "Black", size = 10, family = "serif"),
            axis.text.x = element_text(face = "bold", color = "Black", size = 18, family = "serif", angle = 0, hjust = 0.5),
            axis.text.y = element_text(face = "bold", color = "Black", size = 18, family = "serif", angle = 90, hjust = 0.5))

    print(p0 + (p1 / p2) + plot_layout(ncol = 2, widths = c(1.5, 1)))
  }

  # Close the PNG device
  dev.off()

  # Encode and return as base64 string
  encoded <- base64enc::base64encode(outfile)
  unlink(outfile)
  return(encoded)
}



### basic function called by image_FOV_cellType
subset_opt <- function(object = NULL,subset,cells = NULL, idents = NULL, Update.slots = TRUE,Update.object = TRUE,...){
  if (Update.slots) { 
    message("Updating object slots..")
    object %<>% UpdateSlots()
  }
  
  message("Cloning object..")
  obj_subset <- object
  
  # sanity check - use only cell ids (no indices)
  if (all(is.integer(cells))) { 
    cells <- Cells(obj_subset)[cells]
  }
  
  if (!missing(subset) || !is.null(idents)) {
    message("Extracting cells matched to `subset` and/or `idents`")
  }
  
  if (class(obj_subset) == "FOV") {
    message("object class is `FOV` ")
    cells <- Cells(obj_subset)
  } else if (!class(obj_subset) == "FOV" && !missing(subset)) {
    subset <- enquo(arg = subset)
    # cells to keep in the object
    cells <-
      WhichCells(object = obj_subset, 
                 cells = cells,
                 idents = idents,
                 expression = subset,
                 return.null = TRUE, ...)
  } else if (!class(obj_subset) == "FOV" && !is.null(idents)) {
    cells <-
      WhichCells(object = obj_subset, 
                 cells = cells,
                 idents = idents,
                 return.null = TRUE, ...)
  } else if (is.null(cells)) {
    cells <- Cells(obj_subset)
  }
  
  # added support for object class `FOV`
  if (class(obj_subset) == "FOV") {
    message("Matching cells for object class `FOV`..")
    cells_check <- any(obj_subset %>% Cells %in% cells)
  } else { 
    # check if cells are present in all FOV
    message("Matching cells in FOVs..")
    cells_check <-
      lapply(Images(obj_subset) %>% seq, 
             function(i) { 
               any(obj_subset[[Images(obj_subset)[i]]][["centroids"]] %>% Cells %in% cells) 
             }) %>% unlist
  }
  
  if (all(cells_check)) { 
    message("Cell subsets are found in all FOVs!", "\n",
            "Subsetting object..")
    obj_subset %<>% base::subset(cells = cells, idents = idents, ...)
  } else { 
    # if cells are present only in one or several FOVs:
    # subset FOVs
    fovs <- 
      lapply(Images(obj_subset) %>% seq, function(i) {
        if (any(obj_subset[[Images(obj_subset)[i]]][["centroids"]] %>% Cells %in% cells)) {
          message("Cell subsets are found only in FOV: ", "\n", Images(obj_subset)[i])
          message("Subsetting Centroids..")
          base::subset(x = obj_subset[[Images(obj_subset)[i]]], cells = cells, idents = idents, ...)
        }
      }) 
    # replace subsetted FOVs, and remove FOVs with no matching cells
    message("Removing FOVs where cells are NOT found: ", "\n", 
            paste0(Images(object)[which(!cells_check == TRUE)], "\n"), "\n",
            "Subsetting cells..")
    for (i in fovs %>% seq) { obj_subset[[Images(object)[i]]] <- fovs[[i]] }  
    
  }
  
  # subset final object
  obj_subset %<>% base::subset(cells = cells, ...)
  
  if (Update.object && !class(obj_subset) == "FOV") { 
    message("Updating object..")
    obj_subset %<>% UpdateSeuratObject() }
  
  message("Object is ready!")
  return(obj_subset)
}


### image of FOV with cell composition
image_FOV_cellType <- function(Islide, Ipatient, Ifov, Igene) {
  # Islide should be one of "AB_plus_LN_minus","AB_plus_LN_plus", "Control", "T1D" 
  # Ipatient should be of the ids of the 19 patients:"HPAP-008", "HPAP-016", "HPAP-024", "HPAP-029",
  # "HPAP-038", "HPAP-045", "HPAP-072", "HPAP-078", "HPAP-084", "HPAP-089", "HPAP-092", "HPAP-107",
  # "HPAP-122", "HPAP-123", "HPAP-129", "HPAP-131", "HPAP-140", "HPAP-148", "HPAP-149"
  # Ifov should be one of the fov number: 1，2，3，4，5，6，7，8，9，10....105
  # Igene could be null, could be one gene, could be no more than 3 genes, such as "INS, GCG"
  options(future.globals.maxSize = 80000 * 1024^2)
  gene_list <- if (!is.null(Igene)) strsplit(Igene, split = ",")[[1]] else NULL

  # if (!is.null(gene_list)) {
  #   cat("gene_list: ", gene_list, "\n")
  # } else {
  #   cat("Warning: No genes provided (gene_list is NULL)\n")
  # }
  # cat("Islide: ", Islide, "\n")
  # cat("Ipatient: ", Ipatient, "\n")
  # cat("Ifov: ", Ifov, "\n")
  # cat("Available slides:\n")
  # print(unique(obj@meta.data$slide))
  # cat("Available patients:\n")
  # print(unique(obj@meta.data$patient))
  # cat("Available fovs:\n")
  # print(unique(obj@meta.data$fov))
  # cat("Trying to subset with:\n")
  # print(c(Islide, Ipatient, Ifov))
  IF.sub.test <- subset_opt(obj, subset = slide == Islide & patient == Ipatient & fov == Ifov)
  Idents(IF.sub.test) <- factor(IF.sub.test@meta.data$all_celltypes)
  seg.xmin <- min(IF.sub.test$CenterX_global_px)
  seg.xmax <- max(IF.sub.test$CenterX_global_px)
  seg.ymin <- min(IF.sub.test$CenterY_global_px)
  seg.ymax <- max(IF.sub.test$CenterY_global_px)
  cropped.coords <- Crop(IF.sub.test[[unique(IF.sub.test$slide)]], x = c(seg.xmin, seg.xmax), y = c(seg.ymin, seg.ymax), coords = "tissue")
  IF.sub.test[["zoom1"]] <- cropped.coords
  DefaultBoundary(IF.sub.test[["zoom1"]]) <- "segmentation"

  outfile <- tempfile(fileext = ".png")
  png(outfile, width = 1200, height = 1200)
  on.exit({
    try(dev.off(), silent = TRUE)
  }, add = TRUE)

  if (is.null(gene_list)) {
    g <- ImageDimPlot(IF.sub.test, fov = "zoom1", cols = col, alpha = 0.6, crop = TRUE, axes = TRUE, dark.background = FALSE,
                      mols.size = 1.5, nmols = 20000, border.color = NA, coord.fixed = TRUE, size = 1, mols.alpha = 1) +
      theme_bw() +
      theme(panel.grid.minor = element_blank(), panel.grid.major = element_blank()) +
      scale_fill_manual(breaks = labels, values = col)
    print(g)

  } else if (length(gene_list) == 1) {
    g <- ImageDimPlot(IF.sub.test, fov = "zoom1", cols = col, alpha = 0.3, molecules = gene_list, crop = TRUE, axes = TRUE, dark.background = FALSE,
                      mols.cols = "red", mols.size = 1, nmols = 20000, border.color = NA, coord.fixed = TRUE, size = 1, mols.alpha = 1) +
      theme_bw() +
      theme(panel.grid.minor = element_blank(), panel.grid.major = element_blank()) +
      guides(fill = guide_legend(override.aes = list(alpha = 0.3))) +
      scale_fill_manual(breaks = labels, values = col)
    print(g)

  } else if (length(gene_list) <= 3) {
    g <- ImageDimPlot(IF.sub.test, fov = "zoom1", cols = col, alpha = 0.3, molecules = gene_list, crop = TRUE, axes = TRUE, dark.background = FALSE,
                      mols.cols = "red", mols.size = 1, nmols = 20000, border.color = NA, coord.fixed = TRUE, size = 1, mols.alpha = 1) +
      theme_bw() +
      theme(panel.grid.minor = element_blank(), panel.grid.major = element_blank()) +
      guides(fill = guide_legend(override.aes = list(alpha = 0.3))) +
      scale_fill_manual(breaks = labels, values = col) +
      scale_color_manual(values = c("red", "purple", "orange"))
    print(g)

  } else {
    dev.off()
    cat("Too many genes provided.\n")
    return(NULL)
  }

  dev.off()

  encoded <- base64enc::base64encode(outfile)
  unlink(outfile)
  return(encoded)
}




# ======================= FOLLOWING ADDED BY JTC ========================

# cat("start\n")
# image_FOV_cellType("S7280.3","COE05",87,"INS,TOP2A,AZU1", "test2.pdf")
# cat("finished\n")

hex_to_string <- function(hex_str) {
  tryCatch({
    # Force lowercase
    hex_str <- tolower(hex_str)

    # Validate characters
    bad_pos <- gregexpr("[^0-9a-fA-F]", hex_str)[[1]]
    if (bad_pos[1] != -1) {
      cat("Invalid hex characters at positions:", bad_pos, "\n")
      cat("Offending characters:\n")
      cat(substr(hex_str, bad_pos, bad_pos), sep = "\n")
      stop("Hex string contains invalid characters.")
    }

    # Check even length
    if (nchar(hex_str) %% 2 != 0) {
      stop("Odd length hex string")
    }

    # Safe splitting without regex
    hex_split <- substring(hex_str, seq(1, nchar(hex_str), 2), seq(2, nchar(hex_str), 2))

    raw_vec <- as.raw(as.hexmode(hex_split))
    rawToChar(raw_vec)
  }, error = function(e) {
    cat("Hex decode error:", conditionMessage(e), "\n")
    return(NULL)
  })
}


allowed_origins <- c(
  "http://t1dspatialomics.com",
  "http://www.t1dspatialomics.com",
  "http://128.84.40.121"
)



app <- list(
  call = function(req) {
    tryCatch({
      origin <- req$HTTP_ORIGIN
      if (!is.null(origin) && origin %in% allowed_origins) {
        cors_origin <- origin
      } else {
        cors_origin <- '*'
      }
      path <- req$PATH_INFO
      method <- req$REQUEST_METHOD

      # --- CORS preflight handler ---
      if (method == "OPTIONS") {
        return(list(
          status = 204L,
          headers = list(
            'Access-Control-Allow-Origin' = cors_origin,
            'Access-Control-Allow-Methods' = 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers' = 'Content-Type',
            'Access-Control-Max-Age' = '86400'
          ),
          body = ""
        ))
      }

      # --- /genes endpoint ---
      if (path == "/genes") {
        genes <- rownames(obj)
        return(list(
          status = 200L,
          headers = list(
            'Content-Type' = 'application/json',
            'Access-Control-Allow-Origin' = cors_origin
          ),
          body = toJSON(genes)
        ))
      }

      # --- Main data handler ---
      hex_payload <- sub("^.*/", "", path)
      json_data <- hex_to_string(hex_payload)

      if (is.null(json_data)) {
        return(list(
          status = 400L,
          headers = list('Access-Control-Allow-Origin' = cors_origin),
          body = toJSON(list(error = "Failed to decode hex payload"))
        ))
      }

      data <- tryCatch({
        fromJSON(json_data)
      }, error = function(e) {
        cat("JSON parse error:", conditionMessage(e), "\n")
        return(NULL)
      })

      if (is.null(data)) {
        return(list(
          status = 400L,
          headers = list('Access-Control-Allow-Origin' = cors_origin),
          body = toJSON(list(error = "Invalid JSON data"))
        ))
      }

      f <- data$f
      if (f == 1) {
        cat('Calling image_FOV_cellType\n')
        img_data <- image_FOV_cellType(data$p1, data$p2, data$p3, data$p4)
      } else if (f == 2) {
        cat('Calling exp_func\n')
        img_data <- exp_func(data$p1, data$p2)

      } else {
        cat("Unknown function flag:", f, "\n")
        return(list(
          status = 400L,
          headers = list('Access-Control-Allow-Origin' = cors_origin),
          body = toJSON(list(error = "Unknown function flag"))
        ))
      }

      return(list(
        status = 200L,
        headers = list(
          'Access-Control-Allow-Origin' = cors_origin,
          'Content-Type' = 'application/json'
        ),
        body = toJSON(list(status = "finished", img = img_data))
      ))

    }, error = function(e) {
      cat("Top-level R server error:", conditionMessage(e), "\n")
      return(list(
        status = 500L,
        headers = list(
          'Access-Control-Allow-Origin' = cors_origin,
          'Content-Type' = 'application/json'
        ),
        body = toJSON(list(error = "Internal server error"))
      ))
    })
  }
)



# -- Start server --
server <- startServer("0.0.0.0", 5000, app)
cat("R server started on http://localhost:5000\n")

while (TRUE) {
  service()
  Sys.sleep(0.001)
}