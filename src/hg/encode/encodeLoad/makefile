kentSrc = ../../..
# Build encode loader

include ../../../inc/common.mk

SCRIPT_FILES = \
	doEncodeLoad.pl \
	doEncodeUnload.pl
all:
	@${MAKE} --no-print-directory SCRIPTS=${SCRIPTS} scripts

development:
	@${MAKE} --no-print-directory SCRIPTS=${PIPELINE_PATH}/encpipeline_${USER}/bin/scripts scripts schemas

beta:
	@${MAKE} --no-print-directory SCRIPTS=${PIPELINE_PATH}/encpipeline_beta/bin/scripts scripts schemas

prod:
	@${MAKE} --no-print-directory SCRIPTS=${PIPELINE_PATH}/encpipeline_prod/bin/scripts scripts schemas


#encpipeline_{pipeline}/bin/scripts needs to exist, otherwise the dev make could fail
scripts: ${SCRIPT_FILES:%=${SCRIPTS}/%}

${SCRIPTS}/%: %
	chmod +x $<
	perl -c $< 2>&1
	cp -p $< $@.tmp
	mv -f $@.tmp $@


schemas: 
	./installSqlSchemas.pl ${SCRIPTS}/../../config/autoSql

test:
	doEncodeLoad.pl load /cluster/store3/encpipeline_dev/43

clean::
	echo nothing to clean in hg/encode/encodeLoad/
