import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Pagination,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Analytics as AnalyticsIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '../../api/articles';
import { Article, ArticleStatus } from '../../types/article';

interface ArticleManagementPageProps {
  onCreateArticle?: () => void;
  onEditArticle?: (article: Article) => void;
}

export const ArticleManagementPage: React.FC<ArticleManagementPageProps> = ({
  onCreateArticle,
  onEditArticle
}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // Fetch articles
  const {
    data: articlesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['articles', page, limit, search, categoryFilter, statusFilter],
    queryFn: () => articlesApi.getArticles({
      page,
      limit,
      search,
      categoryId: categoryFilter || undefined,
      published: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
      includeCategory: true,
      includeImages: true
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['article-categories'],
    queryFn: () => articlesApi.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Mutations
  const publishMutation = useMutation({
    mutationFn: (articleId: string) => articlesApi.publishArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setPublishDialogOpen(false);
      setSelectedArticle(null);
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: (articleId: string) => articlesApi.unpublishArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setSelectedArticle(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (articleId: string) => articlesApi.deleteArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
    }
  });

  // Event handlers
  const handleActionClick = useCallback((event: React.MouseEvent<HTMLElement>, article: Article) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedArticle(article);
  }, []);

  const handleActionClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedArticle(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedArticle && onEditArticle) {
      onEditArticle(selectedArticle);
    }
    handleActionClose();
  }, [selectedArticle, onEditArticle, handleActionClose]);

  const handlePublish = useCallback(() => {
    if (selectedArticle) {
      if (selectedArticle.isPublished) {
        unpublishMutation.mutate(selectedArticle.id);
      } else {
        setPublishDialogOpen(true);
      }
    }
    handleActionClose();
  }, [selectedArticle, unpublishMutation]);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    handleActionClose();
  }, [handleActionClose]);

  const confirmPublish = useCallback(() => {
    if (selectedArticle) {
      publishMutation.mutate(selectedArticle.id);
    }
  }, [selectedArticle, publishMutation]);

  const confirmDelete = useCallback(() => {
    if (selectedArticle) {
      deleteMutation.mutate(selectedArticle.id);
    }
  }, [selectedArticle, deleteMutation]);

  const getStatusChip = (article: Article) => {
    if (article.isPublished) {
      return <Chip label="Published" color="success" size="small" />;
    }
    return <Chip label="Draft" color="default" size="small" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load articles. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Article Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateArticle}
        >
          Create Article
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | '')}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading articles...
                  </TableCell>
                </TableRow>
              ) : articlesData?.articles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No articles found
                  </TableCell>
                </TableRow>
              ) : (
                articlesData?.articles?.map((article) => (
                  <TableRow key={article.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {article.title}
                        </Typography>
                        {article.summary && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {article.summary.substring(0, 100)}...
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>
                      {article.category?.name || 'Uncategorized'}
                    </TableCell>
                    <TableCell>{getStatusChip(article)}</TableCell>
                    <TableCell>{article.viewCount || 0}</TableCell>
                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Tooltip title="View">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Analytics">
                          <IconButton size="small">
                            <AnalyticsIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, article)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {articlesData?.pagination && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={articlesData.pagination.totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handlePublish}>
          {selectedArticle?.isPublished ? (
            <>
              <UnpublishIcon sx={{ mr: 1 }} />
              Unpublish
            </>
          ) : (
            <>
              <PublishIcon sx={{ mr: 1 }} />
              Publish
            </>
          )}
        </MenuItem>
        <MenuItem>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
        <DialogTitle>Publish Article</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish "{selectedArticle?.title}"?
          </Typography>
          <FormControlLabel
            control={<Switch />}
            label="Also publish to WeChat"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmPublish}
            variant="contained"
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Article</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedArticle?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticleManagementPage;
