TESTER=test-partiel.js ./test-in-docker-from-dir.sh ./partiel-solution && \
TESTER=test-partiel.js ./test-in-docker-from-dir.sh ./partiel-solution > test_results/test-partiel.txt
exit $(git diff | wc -l)
