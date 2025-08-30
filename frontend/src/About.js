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
          marginTop: '2rem', 
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

        {/* Sally Lee */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 , borderRadius: '1rem'}}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  //src={`${process.env.PUBLIC_URL}/imgs/jtc.jpeg`}
                  alt="Sally Lee"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Sally Lee
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Graduate Student
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:sl2767@cornell.edu" style={{ color: theme.palette.primary.main }}>sl2767@cornell.edu</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Sally Lee is a Ph.D. candidate in Biomedical Engineering at Cornell University, where she is advised by Dr. Shuibing Chen at Weill Cornell Medicine. Her research integrates bioinformatics and wet lab techniques to investigate Type 1 and Type 2 diabetes. She holds a dual bachelor's degree in Biology from Emory University and Biomedical Engineering from the Georgia Institute of Technology.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tiancheng Jiao */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 , borderRadius: '1rem'}}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={`${process.env.PUBLIC_URL}/imgs/jtc.jpeg`}
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
        <Paper elevation={2} sx={{ p: 3, mb: 4 , borderRadius: '1rem'}}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={`${process.env.PUBLIC_URL}/imgs/ricky.png`}
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
        <Paper elevation={2} sx={{ p: 3, mb: 4 , borderRadius: '1rem'}}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={`${process.env.PUBLIC_URL}/imgs/yuanhao.jpeg`}
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
        
        {/* Kevin Chang */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 , borderRadius: '1rem'}}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={`${process.env.PUBLIC_URL}/imgs/kvchang_img.jpg`}
                  alt="Kevin Chang"
                  sx={{ width: 150, height: 150, mx: 'auto' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Kevin Chang
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Undergraduate Student
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                Email: <a href="mailto:kvchang@umich.edu" style={{ color: theme.palette.primary.main }}>kvchang@umich.edu</a>
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                Kevin is an undergraduate student in the Department of Electrical Engineering and Computer Science (EECS) at the University of Michigan, 
                pursuing a major in Computer Science with a minor in User Experience Design. He is currently a research assistant in the Liu Lab, with 
                interests in machine learning, large language models, and web development.
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
