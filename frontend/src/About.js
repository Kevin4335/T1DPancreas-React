import React from 'react';
import { Typography, Container, Box, Grid, Paper, Avatar } from '@mui/material';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import { useTheme } from '@mui/material/styles';

function About() {
  const theme = useTheme();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container sx={{ flex: 1 }}>
        
        {/* Welcome Section */}
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 'bold', 
          marginTop: '1rem', 
          textAlign: 'center',
          color: theme.palette.primary.main
        }}>
          Welcome to Shuibing Chen Laboratory!
        </Typography>
        
    
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                The major research interest in the Chen Laboratory is to apply human pluripotent stem cell (hPSC)-derived cells/organoids to model human diseases and perform drug screens toward development of novel therapeutics. We have identified many small molecules controlling stem cell fate decision using high throughput/content chemical screens. By combining gene targeting, directed differentiation, human organoids, and humanized mouse models, we have established several unique models to systematically explore the role of genetic and/or environmental factors in disease progression. We establish proof-of-principle that "disease in a dish" models that can be adapted to high throughput/content screening platforms and to discover drug candidates for precision therapy.
              </Typography>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}>
                Note:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                If you have any questions about this website, please don't hesitate to contact anyone of the members below!
              </Typography>
            </Grid>
            
          </Grid>
        </Box>

        {/* Team Members */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          Our Team
        </Typography>

        {/* Yuling Han */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src="/imgs/yuling.png" 
                  alt="Yuling Han"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Yuling Han, Ph.D.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:hylwayne@outlook.com" style={{ color: theme.palette.primary.main }}>hylwayne@outlook.com</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Dr Yuling Han earned his PhD under the mentorship of Dr Guangxia Gao at the Institute of Biophysics, Chinese Academy of Science, China, where he studied the mechanism of viral-host interaction. Currently, Yuling continues and expands his research interests on pluripotent stem cell derived cells/organoids-based disease modeling and drug screening. He started his academic research to try to dissect the pathogenic mechanism of viruses and alleviate the suffering of patients. Now, he is an independent PI of State Key Laboratory of Stem Cell and Reproductive Biology, Institute of Zoology, Chinese Academy of Sciences (CAS). Beijing, China.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Liuliu Yang */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src="/imgs/liuliu.png" 
                  alt="Liuliu Yang"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Liuliu Yang, Ph.D.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:hylwayne@outlook.com" style={{ color: theme.palette.primary.main }}>hylwayne@outlook.com</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Dr. Liuliu Yang received her B.S. from Shandong University, China and pursued her PhD degree under the mentorship of Dr. Zusen Fan at Institute of Biophysics, Chinese Academy of Science, China. After graduation, she joined Dr. Shuibing Chen's laboratory to study immune-host interaction during disease conditions. Dr Liuliu Yang's major research interests involve creating immune-host organoids and understanding of the impact of immune cells on host tissues in disease conditions, such as COVID-19. She started her academic research to try to dissect the mechanism of human diseases and alleviate the suffering of patients. Now she is an independent PI of State Key Laboratory of Experimental Hematology, National Clinical Research Center for Blood Disease, Haihe Laboratory of Cell Ecosystem, Institute of Hematology & Blood Diseases Hospital, Chinese Academy of Medical Sciences & Peking Union Medical College, Tianjin 300020, China.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Dongliang Leng */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src="/imgs/dongliang.jpg" 
                  alt="Dongliang Leng"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Dongliang Leng, Ph.D.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Postdoc
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:dol4005@med.cornell.edu" style={{ color: theme.palette.primary.main }}>dol4005@med.cornell.edu</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Dr. Dongliang Leng earned his PhD degree from University of Macau under the mentorship of Dr. Qi Zhao and Dr. Xiaohua Douglas Zhang. During his PhD period, he focused on long ncRNAs identification and gene co-expression network construction, which involved in disease initiation and progress, using innovative bioinformatics approaches. In addition, he is also dedicated to construct the disease signatures for diagnosis and prognosis. Notably, he identified a prognostic ceRNA network in sarcoma which contributes to the infiltration of immune cells and shaping of tumor microenvironment. After graduated, he joined Dr. Shuibing Chen's lab at Weill Cornell Medicine to expand his research interest on pluripotent stem cell derived ovary-organoid modeling for anti-aging through identifying the super-TF regulating network for specific populations' differentiation and development in ovary. He is also contributing to the bioinformatics analysis for the projects in the lab across multi single cell sequencing platforms, including 10X single cell transcriptome, multi-omics, spatial sequencing, Pacbio long-reads single cell sequencing and so on.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tiancheng Jiao */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src="/imgs/jtc.jpeg" 
                  alt="Tiancheng Jiao"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Tiancheng Jiao
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Undergraduate Student
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:tcjiao@umich.edu" style={{ color: theme.palette.primary.main }}>tcjiao@umich.edu</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Tiancheng Jiao is an undergraduate student at University of Michigan, majoring in Computer Engineering. He is also purchasing a dual degree in Shanghai Jiao Tong University, majoring in Electrical and Computer Engineering. He is currently working as a research assistant in the Liu Lab. His research interests include machine learning, reinforcement learning, and large language models.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Ricky Han */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src="/imgs/ricky.png" 
                  alt="Ricky Han"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Ricky Han, B.S.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Graduate Student (Bioinformatics)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:rickyhan@umich.edu" style={{ color: theme.palette.primary.main }}>rickyhan@umich.edu</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Ricky earned his bachelor's degree in Applied Mathematics at The Chinese University of Hong Kong, Shenzhen, then gained valuable experience as a research assistant at both the Tsinghua-Berkeley Shenzhen Institute and the Shenzhen Research Institute of Big Data. Currently, he is advancing his studies as a PhD student in Bioinformatics at the University of Michigan, Ann Arbor, under the mentorship of Dr. Jie Liu and Dr. Rajesh Rao. His main research interests involve employing artificial intelligence tools like reinforcement learning, deep learning, and representation learning, to spearhead novel discoveries in Biological Sciences.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Yuanhao Huang */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src="/imgs/yuanhao.jpeg" 
                  alt="Yuanhao Huang"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Yuanhao Huang
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Graduate Student
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:hyhao@umich.edu" style={{ color: theme.palette.primary.main }}>hyhao@umich.edu</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Yuanhao is a PhD student in the Department of Computational Medicine & Bioinformatics (DCMB) in University of Michigan. His research focuses on integrating biomedical knowledge using knowledge graphs and applying biomedical knowledge graphs to large language models.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

      </Container>
      <Footer />
    </div>
  );
}

export default About;
