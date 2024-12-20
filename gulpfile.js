const gulp = require('gulp');
const less = require('gulp-less');
const cleanCss = require('gulp-clean-css');

gulp.task('less-authorization', function() {
    return gulp.src('./authorization/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./authorization'));
})

gulp.task('less-registration', function() {
    return gulp.src('./registration/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./registration'));
})

gulp.task('less-profile', function() {
    return gulp.src('./profile/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./profile'));
})

gulp.task('less-main', function() {
    return gulp.src('./main/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./main'));
})

gulp.task('less-postPage', function() {
    return gulp.src('./postPage/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./postPage'));
})

gulp.task('less-createPost', function() {
    return gulp.src('./createPost/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./createPost'));
})

gulp.task('less-communities', function() {
    return gulp.src('./communities/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./communities'));
})

gulp.task('less-communityPage', function() {
    return gulp.src('./communityPage/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./communityPage'));
})
gulp.task('less-authors', function() {
    return gulp.src('./authors/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./authors'));
})

gulp.task('watch', function() {
    gulp.watch('./authorization/style.less', gulp.series('less-authorization'));
    gulp.watch('./registration/style.less', gulp.series('less-registration'));
    gulp.watch('./profile/style.less', gulp.series('less-profile'));
    gulp.watch('./main/style.less', gulp.series('less-main'));
    gulp.watch('./postPage/style.less', gulp.series('less-postPage'));
    gulp.watch('./createPost/style.less', gulp.series('less-createPost'));
    gulp.watch('./communities/style.less', gulp.series('less-communities'));
    gulp.watch('./communityPage/style.less', gulp.series('less-communityPage'));
    gulp.watch('./authors/style.less', gulp.series('less-authors'));
})


gulp.task('less', gulp.series('less-authorization', 'less-registration', 'less-profile', 'less-main', 'less-postPage', 'less-createPost', 'less-communities',
    'less-communityPage', 'less-authors'
));
gulp.task('default', gulp.series('less', 'watch'));
