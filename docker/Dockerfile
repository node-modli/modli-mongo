FROM ubuntu
MAINTAINER TechnologyAdvice

RUN \
   apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
   echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list && \
   apt-get update && \
   apt-get install -y mongodb-org

ENV MONGODB_USER modli
ENV MONGODB_PASS modli
ENV MONGODB_DATABASE modli

VOLUME ["/data/db"]
WORKDIR /data

ADD startup.sh /startup.sh
RUN chmod 700 /startup.sh

EXPOSE 27017

CMD ["/startup.sh"]