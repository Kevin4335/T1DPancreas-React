# Base image with R pre-installed
FROM rocker/r-base:4.3.1

# Switch apt sources to HTTPS mirror before update (fixes deprecated HTTP mirror issues)
RUN sed -i 's|http://http.debian.net/debian|https://deb.debian.org/debian|g' /etc/apt/sources.list

# Install HTTPS transport support and CA certificates first (for HTTPS apt repos)
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    gnupg2 \
    && rm -rf /var/lib/apt/lists/*

# Install all required system dependencies in one go, clean cache afterwards
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libfontconfig1-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libfreetype6-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    libglpk-dev \
    libgdal-dev \
    libudunits2-dev \
    libgeos-dev \
    libproj-dev \
    gdal-bin \
    pandoc \
    && rm -rf /var/lib/apt/lists/*

# Install required R packages from CRAN and Bioconductor
RUN R -e "install.packages(c('ggplot2', 'RColorBrewer', 'magrittr', 'sf', 'httpuv', 'jsonlite'), repos='https://cloud.r-project.org')" \
 && R -e "install.packages('BiocManager', repos='https://cloud.r-project.org')" \
 && R -e "BiocManager::install('Seurat')"


# Set working directory inside container
WORKDIR /app

# Copy your R server script into container
COPY Functions_for_website.R .

# Run your R server script on container start
CMD ["Rscript", "Functions_for_website.R"]
